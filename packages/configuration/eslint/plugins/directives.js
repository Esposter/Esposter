import DIRECTIVE_REASON_REGEX from "@esposter/configuration/eslint/directiveReasonRegex.js";
import { defineConfig } from "eslint/config";

// The template half of oxlint's `comments/require-directive-reason`: oxlint parses a `.vue` file's script blocks
// Alone, so a `<!-- eslint-disable -->` above or inside `<template>` is a comment only ESLint ever reads, through
// The document fragment vue-eslint-parser builds. The reason pattern is the one oxlint's half imports, and neither
// Half reads the other's comments, so no directive is reported twice.
const DIRECTIVE_REGEX = /^\s*eslint-disable(?:-next-line|-line)?(?:\s|$)/u;

/** @type {import("eslint").Rule.RuleModule} */
const requireTemplateReason = {
  create: (context) => ({
    Program: () => {
      for (const comment of context.sourceCode.parserServices.getDocumentFragment?.()?.comments ?? [])
        if (DIRECTIVE_REGEX.test(comment.value) && !DIRECTIVE_REASON_REGEX.test(comment.value))
          context.report({
            loc: comment.loc,
            message:
              "A disable directive carries its reason after ` -- ` on the directive itself, so the next reader can tell a load-bearing exception from a stale one. See the oxlint skill.",
          });
    },
  }),
  meta: { type: "suggestion" },
};

export default defineConfig({
  files: ["**/*.vue"],
  plugins: { directives: { rules: { "require-template-reason": requireTemplateReason } } },
  rules: { "directives/require-template-reason": "error" },
});
