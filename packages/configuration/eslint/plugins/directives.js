import DIRECTIVE_REASON_MESSAGE from "@esposter/configuration/eslint/directiveReasonMessage.js";
import DIRECTIVE_REASON_REGEX from "@esposter/configuration/eslint/directiveReasonRegex.js";
import { defineConfig } from "eslint/config";

// The template half of oxlint's `comments/require-directive-reason`: oxlint parses a `.vue` file's script blocks
// Alone, so a `<!-- eslint-disable -->` above or inside `<template>` is a comment only ESLint ever reads, through
// The document fragment vue-eslint-parser builds. The reason pattern and the message are the ones oxlint's half
// Imports, and neither half reads the other's comments, so no directive is reported twice.
const DIRECTIVE_REGEX = /^\s*eslint-disable(?:-next-line|-line)?(?:\s|$)/u;

/** @type {import("eslint").Rule.RuleModule} */
const requireTemplateReason = {
  create: (context) => ({
    Program: () => {
      for (const comment of context.sourceCode.parserServices.getDocumentFragment?.()?.comments ?? [])
        if (DIRECTIVE_REGEX.test(comment.value) && !DIRECTIVE_REASON_REGEX.test(comment.value))
          context.report({ loc: comment.loc, message: DIRECTIVE_REASON_MESSAGE });
    },
  }),
  meta: { type: "suggestion" },
};

export default defineConfig({
  files: ["**/*.vue"],
  plugins: { directives: { rules: { "require-template-reason": requireTemplateReason } } },
  rules: { "directives/require-template-reason": "error" },
});
