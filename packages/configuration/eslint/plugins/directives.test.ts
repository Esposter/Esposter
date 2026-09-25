import directives from "@esposter/configuration/eslint/plugins/directives.js";
import { Linter } from "eslint";
import { describe, expect, test } from "vitest";
import parser from "vue-eslint-parser";

describe("directives", () => {
  const linter = new Linter({ configType: "flat" });
  const lint = (source: string) =>
    linter
      .verify(source, [...directives, { files: ["**/*.vue"], languageOptions: { parser } }], "a.vue")
      .filter(({ ruleId }) => ruleId === "directives/require-template-reason").length;

  test.each([
    { name: "fileWithoutReason", source: `<!-- eslint-disable a/b -->\n<template><div /></template>`, violations: 1 },
    {
      name: "nextLineWithoutReason",
      source: `<template>\n  <!-- eslint-disable-next-line a/b -->\n  <div />\n</template>`,
      violations: 1,
    },
    // A separator with nothing after it states no reason
    { name: "emptyReason", source: `<!-- eslint-disable a/b -- -->\n<template><div /></template>`, violations: 1 },
    { name: "fileWithReason", source: `<!-- eslint-disable a/b -- a -->\n<template><div /></template>`, violations: 0 },
    {
      name: "nextLineWithReason",
      source: `<template>\n  <!-- eslint-disable-next-line a/b -- a -->\n  <div />\n</template>`,
      violations: 0,
    },
    // Closing a range is not a directive that needs defending
    { name: "enableDirective", source: `<!-- eslint-enable a/b -->\n<template><div /></template>`, violations: 0 },
    // Prose naming a directive is not one
    {
      name: "namesDirective",
      source: `<!-- a carries an eslint-disable -->\n<template><div /></template>`,
      violations: 0,
    },
  ])("$name", ({ source, violations }) => {
    expect.hasAssertions();

    expect(lint(source)).toBe(violations);
  });
});
