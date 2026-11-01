// ESLint flat config, the same rule sets as the family's template-assembled sites.
//
// Uses @next/eslint-plugin-next directly rather than the eslint-config-next bundle: the bundle
// hard-`require`s next's babel parser, which a pnpm-workspace layout can't always satisfy. The
// standalone plugin needs nothing from `next`.
//
// Rules are the framework "recommended" sets (syntactic, NOT type-checked) so linting stays fast.

import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.next-*/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/public/**", // static assets served verbatim; never source to lint
      "**/.vercel/**",
      "**/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  {
    rules: {
      // Ignore intentional `_`-prefixed unused bindings (a widely-used convention) and caught errors.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      // The site is a faithful port of the Jekyll site: plain <img> tags serving the files in
      // public/ as they are, and the Google Fonts stylesheet the original CSS names its families
      // from. next/image and next/font are design changes for a later pass, not this port.
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
  {
    // Config files are Node tooling, not browser-bundle code — give them node globals.
    files: ["**/*.config.{js,cjs,mjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
];
