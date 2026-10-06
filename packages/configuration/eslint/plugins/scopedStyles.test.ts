import scopedStyles from "@esposter/configuration/eslint/plugins/scopedStyles.js";
import { Linter } from "eslint";
import { describe, expect, test } from "vitest";
import parser from "vue-eslint-parser";

describe("scopedStyles", () => {
  const linter = new Linter({ configType: "flat" });
  const lint = (template: string) =>
    linter
      .verify(
        `<template>${template}</template>`,
        [...scopedStyles, { files: ["**/*.vue"], languageOptions: { parser } }],
        "a.vue",
      )
      .filter(({ ruleId }) => ruleId === "scoped-styles/no-unknown-attribute").length;

  test.each([
    { name: "utilityAttribute", template: `<div size-full />`, violations: 1 },
    { name: "utilityAttributeWithValue", template: `<div p="2" />`, violations: 1 },
    { name: "boundUtilityAttribute", template: `<div :p="padding" />`, violations: 1 },
    // An attribute of another element is none of this one's
    { name: "otherElementsAttribute", template: `<div href="a" />`, violations: 1 },
    { name: "globalAttribute", template: `<div class="a" hidden />`, violations: 0 },
    { name: "elementsOwnAttribute", template: `<canvas width="1" />`, violations: 0 },
    { name: "ariaAttribute", template: `<div role="status" aria-live="polite" />`, violations: 0 },
    { name: "dataAttribute", template: `<div data-a="a" />`, violations: 0 },
    { name: "vueReservedAttribute", template: `<div ref="a" :key="a" />`, violations: 0 },
    { name: "directive", template: `<div v-if="a" @click="a" v-bind="a" />`, violations: 0 },
    // A component's props are its own, whatever they are named
    { name: "component", template: `<GameScreen size-full />`, violations: 0 },
    { name: "svgAttribute", template: `<svg viewBox="0 0 1 1"><path d="M0 0" /></svg>`, violations: 0 },
    { name: "slotProp", template: `<slot :item="a" />`, violations: 0 },
  ])("$name", ({ template, violations }) => {
    expect.hasAssertions();

    expect(lint(template)).toBe(violations);
  });
});
