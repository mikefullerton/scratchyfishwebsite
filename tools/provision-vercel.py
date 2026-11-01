#!/usr/bin/env python3
"""Provision the three Vercel projects that serve scratchyfish.com.

  scratchyfish-production   production branch   scratchyfish.com, www.scratchyfish.com
  scratchyfish-staging      staging branch      staging.scratchyfish.com
  scratchyfish-testing      testing branch      testing.scratchyfish.com

Production and staging deploy the SEPARATE deployment repo (DEPLOY_REPO below),
one branch per tier, which only `shipr deploy` advances. Testing deploys THIS
repo's `testing` branch (DEV_REPO), because `.shipr` declares
`[environments.testing] repo = "development"`: testr merges work into the dev
repo's `testing`, and a project watching the mirror would build a copy nobody
pushed to. Same shape as the fishlamp projects, whose script this is adapted from.

Preview deployments are enabled ONLY on `scratchyfish-testing`: a preview URL is
the way to look at a branch before it reaches a tier, and one tier is enough.

Each project's tier is carried by `DEPLOYMENT_ENV`, which next.config.ts promotes
to the client-inlined `NEXT_PUBLIC_DEPLOYMENT_ENV`. Every tier makes
VERCEL_ENV=production deployments of its own branch, so Vercel's own env label
cannot tell them apart.

`GH_SUBMODULE_TOKEN` is the GitHub token vercel.json's install step
(websites/tools/fetch_submodules.py) uses to check out the private submodules.
It is a secret, so it is never written here: pass it in the environment and it
is upserted as an encrypted variable on every project. Run without it, a project
that already has it keeps it, and one that does not is reported as a failure —
its builds cannot fetch websites/external/whatsnowtoolkit.

Idempotent: existing projects are reconciled in place, and settings are PATCHed
only when they actually differ. Exits non-zero if anything could not be fully
provisioned. Uses $VERCEL_TOKEN if set, else the Vercel CLI's stored token,
loaded lazily so --help works without auth.

  python3 tools/provision-vercel.py --dry-run
  python3 tools/provision-vercel.py --only scratchyfish-testing
  GH_SUBMODULE_TOKEN=... python3 tools/provision-vercel.py      # all three, live
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

SLUG = "mikefullertons-projects"
DEPLOY_REPO = "DeploymentRepos/scratchyfishwebsite-deployment"
DEV_REPO = "mikefullerton/scratchyfishwebsite"
ROOT_DIR = "websites/main"
APEX = "scratchyfish.com"  # takes A records; every other host takes a CNAME
AUTH_FILE = "~/Library/Application Support/com.vercel.cli/auth.json"
SUBMODULE_TOKEN = "GH_SUBMODULE_TOKEN"
# Hosts that permanently redirect (308) to another host instead of serving the site.
REDIRECTS = {"www.scratchyfish.com": APEX}
REDIRECT_STATUS = 308

# The three tiers. `previews` maps to previewDeploymentsDisabled (inverted).
# Every tier deploys the branch named after it, so `env` is also the branch name.
TIERS = [
    {"name": "scratchyfish-production", "env": "production", "repo": DEPLOY_REPO,
     "domains": ["scratchyfish.com", "www.scratchyfish.com"], "previews": False},
    {"name": "scratchyfish-staging", "env": "staging", "repo": DEPLOY_REPO,
     "domains": ["staging.scratchyfish.com"], "previews": False},
    {"name": "scratchyfish-testing", "env": "testing", "repo": DEV_REPO,
     "domains": ["testing.scratchyfish.com"], "previews": True},
]

# Settings every project must carry; compared before PATCHing so reruns don't
# issue no-op writes.
#   • buildCommand/outputDirectory null — defer to the site's vercel.json and
#     Next's default `.next` output dir.
#   • enableAffectedProjectsDeployments — skip a deploy when nothing under the
#     root directory or its deps changed.
BASE_SETTINGS = {
    "framework": "nextjs",
    "rootDirectory": ROOT_DIR,
    "enableAffectedProjectsDeployments": True,
    "buildCommand": None,
    "outputDirectory": None,
}

FAILURES: list[str] = []
_token: str | None = None


def get_token() -> str:
    """Load the Vercel CLI token lazily so --help / arg errors don't need auth."""
    global _token
    if _token is None:
        if os.environ.get("VERCEL_TOKEN", "").strip():
            _token = os.environ["VERCEL_TOKEN"].strip()
            return _token
        path = os.path.expanduser(AUTH_FILE)
        try:
            with open(path) as fh:
                _token = json.load(fh)["token"]
        except (OSError, KeyError, ValueError) as e:
            raise SystemExit(
                f"Could not read Vercel token from {path} ({e}). Run `vercel login` first."
            )
    return _token


def _check_auth(code: int, data: dict) -> None:
    """Stop on an expired token instead of reporting it as N failed writes."""
    if code == 403 and data.get("error", {}).get("invalidToken"):
        raise SystemExit(
            f"Vercel rejected the token in {AUTH_FILE} (expired). "
            "Run `vercel login`, or set VERCEL_TOKEN to a dashboard token."
        )


def api(method: str, path: str, body: object | None = None) -> tuple[int, dict]:
    sep = "&" if "?" in path else "?"
    url = f"https://api.vercel.com{path}{sep}slug={SLUG}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={"Authorization": f"Bearer {get_token()}",
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or "{}")
    except urllib.error.HTTPError as e:
        code, data = e.code, json.loads(e.read() or "{}")
        _check_auth(code, data)
        return code, data


def get_project(name: str) -> dict | None:
    code, data = api("GET", f"/v9/projects/{name}")
    return data if code == 200 else None


def production_branch(proj: dict | None) -> str | None:
    # `link` may be absent OR present-but-null (project with no git connection).
    return ((proj or {}).get("link") or {}).get("productionBranch")


def ensure_project(tier: dict, dry: bool) -> dict | None:
    name = tier["name"]
    proj = get_project(name)
    if proj is None:
        if dry:
            print(f"    would CREATE {name} ({tier['repo']} branch {tier['env']})")
            return None
        code, proj = api("POST", "/v11/projects", {
            "name": name,
            "framework": "nextjs",
            "rootDirectory": ROOT_DIR,
            "gitRepository": {"type": "github", "repo": tier["repo"]},
        })
        if code not in (200, 201):
            FAILURES.append(f"{name}: create failed {code} {proj.get('error')}")
            print(f"    !! create failed {code}: {proj.get('error')}")
            return None
        print(f"    created {name}")
    else:
        print(f"    exists  {name}")

    if dry:
        if proj is not None and linked_repo(proj) != tier["repo"].lower():
            print(f"      would RELINK {linked_repo(proj)} -> {tier['repo']}")
        return proj

    pid = proj["id"]
    proj = ensure_link(pid, name, proj, tier["repo"])
    desired = {**BASE_SETTINGS, "previewDeploymentsDisabled": not tier["previews"]}
    if any(proj.get(k) != v for k, v in desired.items()):
        code, data = api("PATCH", f"/v9/projects/{pid}", desired)
        if code == 200:
            print(f"      settings reconciled (previews="
                  f"{'on' if tier['previews'] else 'off'})")
        else:
            FAILURES.append(f"{name}: settings PATCH failed {code}")
            print(f"      settings [!! {code} {data.get('error', {}).get('message')}]")
    else:
        print("      settings [ok, unchanged]")

    set_prod_branch(pid, name, proj, tier["env"])
    return proj


def linked_repo(proj: dict | None) -> str | None:
    link = (proj or {}).get("link") or {}
    return f"{link.get('org')}/{link.get('repo')}".lower() if link.get("repo") else None


def ensure_link(pid: str, name: str, proj: dict, repo: str) -> dict:
    """Point the project's git connection at `repo`, replacing any other one."""
    if linked_repo(proj) == repo.lower():
        print(f"      git {repo} [ok, unchanged]")
        return proj
    if linked_repo(proj):
        code, data = api("DELETE", f"/v9/projects/{pid}/link")
        if code not in (200, 204):
            FAILURES.append(f"{name}: unlink {linked_repo(proj)} failed {code}")
            print(f"      git [!! unlink {code} {data.get('error', {}).get('message')}]")
            return proj
    code, data = api("POST", f"/v9/projects/{pid}/link", {"type": "github", "repo": repo})
    if code in (200, 201):
        print(f"      git -> {repo} [ok]")
        return data
    FAILURES.append(f"{name}: link {repo} failed {code}")
    print(f"      git -> {repo} [!! {code} {data.get('error', {}).get('message')}]")
    return get_project(pid) or proj


def set_prod_branch(pid: str, name: str, proj: dict, branch: str) -> None:
    if production_branch(proj) == branch:
        print(f"      production branch = {branch} [ok, unchanged]")
        return
    code, data = api("PATCH", f"/v1/projects/{pid}/branch", {"branch": branch})
    if code == 200 and production_branch(data) in (branch, None):
        print(f"      production branch -> {branch} [ok]")
        return
    cur = production_branch(get_project(pid))
    if cur == branch:
        print(f"      production branch -> {branch} [ok]")
    else:
        msg = data.get("error", {}).get("message", "")
        FAILURES.append(
            f"{name}: production branch WANTED {branch}, GOT {cur} ({code} {msg})")
        print(f"      production branch -> {cur} [!! WANTED {branch} ({code} {msg})]")


def existing_env_keys(pid: str) -> set[str]:
    code, data = api("GET", f"/v9/projects/{pid}/env")
    return {e["key"] for e in data.get("envs", [])} if code == 200 else set()


def set_envs(pid: str, name: str, env: str, dry: bool) -> None:
    """Upsert the tier's build-time variables, in one POST.

    DEPLOYMENT_ENV is read while `next build` runs, so it must exist in the BUILD
    environment; setting it after a build cannot repair that build.
    """
    body = [{"key": "DEPLOYMENT_ENV", "value": env, "type": "plain",
             "target": ["production", "preview"]}]
    secret = os.environ.get(SUBMODULE_TOKEN, "").strip()
    if secret:
        body.append({"key": SUBMODULE_TOKEN, "value": secret, "type": "encrypted",
                     "target": ["production", "preview", "development"]})
    if dry:
        print(f"      env DEPLOYMENT_ENV={env}")
        print(f"      env {SUBMODULE_TOKEN}="
              + ("(from environment, encrypted)" if secret else "(not supplied — kept if present)"))
        return
    code, data = api("POST", f"/v10/projects/{pid}/env?upsert=true", body)
    if code in (200, 201):
        print(f"      env DEPLOYMENT_ENV={env} [ok]")
        if secret:
            print(f"      env {SUBMODULE_TOKEN} [ok, encrypted]")
    else:
        FAILURES.append(f"{name}: env set failed {code}")
        print(f"      env [!! {code} {data.get('error', {}).get('code')}]")
        return
    if not secret:
        if SUBMODULE_TOKEN in existing_env_keys(pid):
            print(f"      env {SUBMODULE_TOKEN} [ok, already set]")
        else:
            FAILURES.append(f"{name}: {SUBMODULE_TOKEN} not set — builds cannot fetch the "
                            "private submodules; rerun with it in the environment")
            print(f"      env {SUBMODULE_TOKEN} [!! missing]")


def add_domain(pid: str, name: str, domain: str, dry: bool) -> None:
    if dry:
        print(f"      domain {domain}")
        return
    code, data = api("POST", f"/v10/projects/{pid}/domains", {"name": domain})
    err = data.get("error", {}).get("code")
    if code in (200, 201):
        print(f"      domain {domain} [added]")
    elif code == 409 or err in ("domain_already_in_use", "domain_taken"):
        print(f"      domain {domain} [already attached]")
    else:
        FAILURES.append(f"{name}: domain {domain} failed {code} {err}")
        print(f"      domain {domain} [!! {code} {err}: "
              f"{data.get('error', {}).get('message')}]")
        return
    set_redirect(pid, name, domain)


def set_redirect(pid: str, name: str, domain: str) -> None:
    """Make `domain` redirect to its REDIRECTS target, or serve the site if it has none."""
    want = REDIRECTS.get(domain)
    want_code = REDIRECT_STATUS if want else None
    code, data = api("GET", f"/v9/projects/{pid}/domains/{domain}")
    if code != 200:
        FAILURES.append(f"{name}: read domain {domain} failed {code}")
        print(f"      domain {domain} [!! could not read: {code}]")
        return
    if data.get("redirect") == want and data.get("redirectStatusCode") == want_code:
        if want:
            print(f"      domain {domain} [redirects to {want}, unchanged]")
        return
    code, data = api("PATCH", f"/v9/projects/{pid}/domains/{domain}",
                     {"redirect": want, "redirectStatusCode": want_code})
    if code == 200:
        print(f"      domain {domain} [{'redirect → ' + want if want else 'redirect cleared'}]")
    else:
        FAILURES.append(f"{name}: redirect {domain} failed {code}")
        print(f"      domain {domain} [!! redirect {code}: "
              f"{data.get('error', {}).get('message')}]")


def _rank1(entries: list) -> list[str]:
    """Flatten Vercel's ranked recommendation list to the rank-1 value(s)."""
    if not entries:
        return []
    best = min(entries, key=lambda e: e.get("rank", 99)) if isinstance(entries[0], dict) \
        else {"value": entries[0]}
    value = best.get("value")
    return [v.rstrip(".") for v in (value if isinstance(value, list) else [value])]


def report_dns(tiers: list[dict]) -> None:
    """Print the DNS records each host needs, and flag the records they would replace.

    Attaching a domain to a Vercel project does NOT create its DNS record when the
    zone is managed elsewhere (Cloudflare, here). The apex needs A records;
    subdomains take a CNAME.
    """
    print("\nDNS records each host needs:\n")
    print(f"  {'HOST':<28} {'TYPE':<6} VALUE")
    print(f"  {'-' * 28} {'-' * 6} {'-' * 40}")
    conflicts: list[str] = []
    for tier in tiers:
        for domain in tier["domains"]:
            code, cfg = api("GET", f"/v6/domains/{domain}/config")
            if code != 200:
                print(f"  {domain:<28} [!! could not read config: {code}]")
                continue
            if domain == APEX:
                for ip in _rank1(cfg.get("recommendedIPv4") or []):
                    print(f"  {domain:<28} {'A':<6} {ip}")
            else:
                for cname in _rank1(cfg.get("recommendedCNAME") or []):
                    print(f"  {domain:<28} {'CNAME':<6} {cname}")
            existing = (cfg.get("aValues") or []) + (cfg.get("cnames") or [])
            # Only a host Vercel calls misconfigured is pointed somewhere else.
            if existing and cfg.get("misconfigured"):
                conflicts.append(f"  {domain} currently resolves to "
                                 f"{', '.join(v.rstrip('.') for v in existing)}")
    if conflicts:
        print("\n  Existing records that will be REPLACED:")
        for c in conflicts:
            print(c)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true",
                    help="print what would change without writing")
    ap.add_argument("--only", metavar="PROJECT",
                    help="provision just one project by name")
    ap.add_argument("--skip-domains", action="store_true",
                    help="leave domain attachment alone")
    args = ap.parse_args()

    tiers = [t for t in TIERS if not args.only or t["name"] == args.only]
    if not tiers:
        raise SystemExit(f"No tier named {args.only!r}. "
                         f"Known: {', '.join(t['name'] for t in TIERS)}")

    for tier in tiers:
        print(f"\n{tier['name']}  (root {ROOT_DIR}, branch {tier['env']})")
        proj = ensure_project(tier, args.dry_run)
        if proj is None and not args.dry_run:
            continue
        pid = proj["id"] if proj else "(dry-run)"
        set_envs(pid, tier["name"], tier["env"], args.dry_run)
        if not args.skip_domains:
            for domain in tier["domains"]:
                add_domain(pid, tier["name"], domain, args.dry_run)

    if not args.dry_run and not args.skip_domains:
        report_dns(tiers)

    if FAILURES:
        print("\nFAILURES:")
        for f in FAILURES:
            print(f"  - {f}")
        return 1
    print("\nAll projects provisioned." if not args.dry_run else "\nDry run complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
