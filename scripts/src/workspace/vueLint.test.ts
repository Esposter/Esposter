import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { jsonDateParse } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface VizeLintReport {
  file: string;
  messages: { line: number; ruleId: string }[];
}
// A component's script is all oxlint reads, and a JS plugin reports a template finding on the script or not at all, so
// The template rules run in vize's own lint over the root `vite.config.ts`. Each planted component breaks one template rule
// On a known line. The script-first one also binds `v-html`, which vize reports by default and the repository allows, so
// A finding list read under vize's defaults instead of the repository's configuration fails too
describe("vueLint", () => {
  const VIZE_BINARY_PATH = join(REPOSITORY_ROOT, "node_modules", "vize", "bin", "vize");
  const COMPONENT_TEXT_MAP = {
    "List.vue": `<template>
  <ul>
    <li v-for="item in [1, 2]">{{ item }}</li>
  </ul>
</template>
`,
    "Table.vue": `<script setup lang="ts">
const items = [1, 2];
const html = "";
</script>

<template>
  <ul>
    <li v-for="item in items">{{ item }}</li>
  </ul>
  <div v-html="html"></div>
</template>
`,
  };
  let root: string;
  let findingMap = new Map<string, string[]>();

  beforeAll(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "vue-lint-")));
    const filePaths = Object.entries(COMPONENT_TEXT_MAP).map(([fileName, text]) => {
      const filePath = join(root, fileName);
      writeFileSync(filePath, text);
      return filePath;
    });
    const { stdout } = spawnSync(process.execPath, [VIZE_BINARY_PATH, "lint", "--format", "json", ...filePaths], {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
    });
    findingMap = new Map(
      jsonDateParse<VizeLintReport[]>(stdout).map(({ file, messages }) => [
        basename(file),
        messages.map(({ line, ruleId }) => `${ruleId}:${line}`),
      ]),
    );
  });

  afterAll(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("a finding in a script-first component", () => {
    expect.hasAssertions();

    expect(findingMap.get("Table.vue")).toStrictEqual(["vue/require-v-for-key:8"]);
  });

  test("a finding in a component with no script", () => {
    expect.hasAssertions();

    expect(findingMap.get("List.vue")).toStrictEqual(["vue/require-v-for-key:3"]);
  });
});
