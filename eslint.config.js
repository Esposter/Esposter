import eslintConfiguration from "@esposter/configuration/eslint/index.typescript.js";

// The workflow scripts are async function bodies the harness injects globals into, so they end in a top-level
// `return` — which is a parse error for ESLint's parser, not a lint finding it could report. Oxlint parses them
// Fine and covers them instead; only `unicorn/prefer-module` is turned off for them in `.oxlintrc.json`.
export default eslintConfiguration.append({ ignores: ["packages", ".claude"] });
