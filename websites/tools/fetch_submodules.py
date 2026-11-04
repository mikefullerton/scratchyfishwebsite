#!/usr/bin/env python3
"""fetch_submodules — populate private git submodules on a build host that cannot.

Vercel fetches only submodules that are publicly readable over HTTPS during its clone
step (https://vercel.com/docs/builds/build-features); a private one arrives empty and
the clone log says "Failed to fetch one or more git submodules". agenticdevelopertoolkit
is private, so every site that reaches it through `external/adhsdk`
would build against an empty directory.

Run this FIRST in the Vercel install command, before `pnpm install` resolves any
`link:` dep into the submodule:

    "installCommand": "python3 ../tools/fetch_submodules.py && cd .. && pnpm install ..."

With `GH_SUBMODULE_TOKEN` set (a GitHub token that can read the private submodule
repos — a Vercel env var on every project that needs it), every github.com HTTPS fetch
carries the token and each submodule that is not already populated is checked out at
its recorded gitlink. Without the token (a developer's machine, where the submodules are
already checked out) it only verifies they are present, and fails with the fix if not —
here, rather than as a cryptic "No projects matched the filters" further down the build.

stdlib only; the build image has python3 and git and nothing else is promised.
"""
from __future__ import annotations

import os
import subprocess
import sys

TOKEN_ENV = "GH_SUBMODULE_TOKEN"


def git(*args: str, cwd: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=cwd, check=check, text=True, capture_output=True)


def toplevel() -> str | None:
    try:
        return git("rev-parse", "--show-toplevel", cwd=os.getcwd()).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def unpopulated(root: str) -> list[str]:
    """Submodule paths that are not checked out at their recorded gitlink.

    A non-empty directory is not enough: Vercel restores its build cache AFTER the
    clone, and the cache carries `node_modules` from inside the submodule's tree, so a
    private submodule its native fetch left empty arrives full of debris. Nor is
    `git submodule status`: the failed fetch can leave HEAD at the gitlink with nothing
    checked out. Populated means the path is its own git checkout, HEAD is the gitlink,
    and every file it tracks is on disk.
    """
    out = git("config", "-f", ".gitmodules", "--get-regexp", r"^submodule\..*\.path$",
              cwd=root, check=False).stdout
    return [path for path in (line.split(" ", 1)[1].strip() for line in out.splitlines())
            if not checked_out(root, path)]


def checked_out(root: str, path: str) -> bool:
    full = os.path.join(root, path)
    if not os.path.isdir(full):
        return False
    tree = git("ls-tree", "HEAD", "--", path, cwd=root, check=False).stdout.split()
    if len(tree) < 3 or tree[1] != "commit":
        return False
    top = git("rev-parse", "--show-toplevel", cwd=full, check=False)
    head = git("rev-parse", "HEAD", cwd=full, check=False)
    if top.returncode != 0 or os.path.realpath(top.stdout.strip()) != os.path.realpath(full):
        return False
    if head.returncode != 0 or head.stdout.strip() != tree[2]:
        return False
    tracked = git("ls-files", cwd=full, check=False).stdout.splitlines()
    missing = git("ls-files", "--deleted", cwd=full, check=False).stdout.strip()
    return bool(tracked) and not missing


def main() -> int:
    root = toplevel()
    if root is None:
        print("fetch_submodules: not a git checkout — assuming submodules are present")
        return 0
    missing = unpopulated(root)
    if not missing:
        print("fetch_submodules: every submodule is populated")
        return 0

    token = os.environ.get(TOKEN_ENV, "").strip()
    if not token:
        print(f"fetch_submodules: {TOKEN_ENV} is unset and these submodules are not checked out:",
              file=sys.stderr)
        for path in missing:
            print(f"  - {path}", file=sys.stderr)
        print(f"\nOn Vercel: set {TOKEN_ENV} to a GitHub token that can read the private\n"
              "submodule repos. Locally: git submodule update --init --recursive",
              file=sys.stderr)
        return 1

    # --global so the child git processes `submodule update` spawns inherit the rewrite.
    # The build container is ephemeral; it is still removed in `finally`.
    rewrite = f"url.https://x-access-token:{token}@github.com/.insteadOf"
    git("config", "--global", "--add", rewrite, "https://github.com/", cwd=root)
    git("config", "--global", "--add", rewrite, "git@github.com:", cwd=root)
    try:
        git("submodule", "sync", "--recursive", cwd=root)
        for path in missing:
            # A restored build cache or Vercel's half-init leaves state that makes a
            # plain `update` skip the checkout; deinit hands it an empty slate.
            git("submodule", "deinit", "--force", "--", path, cwd=root, check=False)
            shallow = git("submodule", "update", "--init", "--recursive", "--force",
                          "--depth", "1", "--", path, cwd=root, check=False)
            if shallow.returncode != 0:
                # The gitlink is not fetchable shallowly (an unadvertised SHA on a host
                # that refuses it): fall back to a full fetch rather than fail the build.
                r = git("submodule", "update", "--init", "--recursive", "--force", "--", path,
                        cwd=root, check=False)
                if r.returncode != 0:
                    print(f"fetch_submodules: could not fetch {path}:\n"
                          f"{r.stderr.replace(token, '***')}", file=sys.stderr)
                    return 1
            print(f"fetch_submodules: fetched {path}")
    finally:
        git("config", "--global", "--unset-all", rewrite, cwd=root, check=False)

    still = unpopulated(root)
    if still:
        print(f"fetch_submodules: still not checked out after fetch: {still}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
