import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { jsonDateParse } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface VizeLintReport {
  file: string;
  messages: { message: string }[];
}
// A package styled by scoped CSS generates no utility from an attribute, so an attribute the HTML standard does not
// Define on a native element styles nothing there. vize matches its entries by the path under its root, so each fixture
// Is linted inside a copy of one such package's path, under a root whose config is the repository's own
describe("scopedStyles", () => {
  const VIZE_BINARY_PATH = join(REPOSITORY_ROOT, "node_modules", "vize", "bin", "vize");
  const MESSAGE_START = "Don't write an attribute the HTML standard does not define";
  const FIXTURES = [
    { name: "utilityAttribute", template: `<div size-full />`, violations: 1 },
    { name: "utilityAttributeWithValue", template: `<div p="2" />`, violations: 1 },
    { name: "boundUtilityAttribute", template: `<div :p="padding" />`, violations: 1 },
    // An attribute of another element is none of this one's
    { name: "otherElementsAttribute", template: `<div href="a" />`, violations: 1 },
    { name: "globalAttribute", template: `<div class="a" hidden />`, violations: 0 },
    // The shadow-part globals are the standard's own, on every element (upstream issue 12)
    { name: "shadowPartGlobalAttributes", template: `<div part="a" exportparts="b" />`, violations: 0 },
    { name: "elementsOwnAttribute", template: `<canvas width="1" />`, violations: 0 },
    { name: "ariaAttribute", template: `<div role="status" aria-live="polite" />`, violations: 0 },
    { name: "dataAttribute", template: `<div data-a="a" />`, violations: 0 },
    { name: "vueReservedAttribute", template: `<div ref="a" :key="a" />`, violations: 0 },
    { name: "directive", template: `<div v-if="a" @click="a()" :="a" />`, violations: 0 },
    // A component's props are its own, whatever they are named
    { name: "component", template: `<GameScreen size-full />`, violations: 0 },
    // SVG's own elements share some of HTML's names, and their attributes are SVG's
    { name: "svgAttribute", template: `<svg viewBox="0 0 1 1"><a href="a" /><path d="M0 0" /></svg>`, violations: 0 },
    { name: "slotProp", template: `<slot :item="a" />`, violations: 0 },
  ];
  let root: string;
  let violationsMap = new Map<string, number>();

  beforeAll(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "scoped-styles-")));
    const packageDirectory = join(root, "packages", "vue-phaserjs");
    mkdirSync(packageDirectory, { recursive: true });
    writeFileSync(
      join(root, "vite.config.mjs"),
      `export { default } from "${pathToFileURL(join(REPOSITORY_ROOT, "vite.config.ts")).href}";\n`,
    );
    const filePaths = FIXTURES.map(({ name, template }) => {
      const filePath = join(packageDirectory, `${name}.vue`);
      writeFileSync(filePath, `<template>\n  ${template}\n</template>\n`);
      return filePath;
    });
    const { stdout } = spawnSync(process.execPath, [VIZE_BINARY_PATH, "lint", "--format", "json", ...filePaths], {
      cwd: root,
      encoding: "utf8",
    });
    violationsMap = new Map(
      jsonDateParse<VizeLintReport[]>(stdout).map(({ file, messages }) => [
        basename(file, ".vue"),
        messages.filter(({ message }) => message.includes(MESSAGE_START)).length,
      ]),
    );
  });

  afterAll(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(violationsMap.get(name) ?? 0).toBe(violations);
  });
});
