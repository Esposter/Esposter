import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortSwitchCase", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export const f = (k: number) => {\n  switch (k) {\n    case 1: return 0;\n    case 2: return 1;\n  }\n};`,
        name: "unsortedBlocks",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 2: return 1;\n    case 1: return 0;\n  }\n};`,
        violations: 1,
      },
      {
        name: "sortedBlocks",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 1: return 0;\n    case 2: return 1;\n  }\n};`,
        violations: 0,
      },
      {
        fixed: `export const f = (k: number) => {\n  switch (k) {\n    case 1:\n    case 2: return 0;\n  }\n};`,
        name: "unsortedFallthroughTests",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 2:\n    case 1: return 0;\n  }\n};`,
        violations: 1,
      },
      {
        name: "sortedFallthroughTests",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 1:\n    case 2: return 0;\n  }\n};`,
        violations: 0,
      },
      {
        fixed: `export const f = (k: number) => {\n  switch (k) {\n    case 1:\n    default: return 0;\n  }\n};`,
        name: "defaultBeforeLast",
        source: `export const f = (k: number) => {\n  switch (k) {\n    default:\n    case 1: return 0;\n  }\n};`,
        violations: 1,
      },
      {
        name: "defaultLast",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 1: return 0;\n    default: return 2;\n  }\n};`,
        violations: 0,
      },
      {
        name: "lastBlockWithoutBreakStaysLast",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 2: return 1;\n    case 1: k += 1;\n  }\n};`,
        violations: 0,
      },
      {
        name: "conditionDiscriminant",
        source: `export const f = (a: number, b: number) => {\n  switch (a > b) {\n    case true: return 1;\n    case false: return 0;\n  }\n};`,
        violations: 0,
      },
      {
        name: "conditionTest",
        source: `export const f = (a: number, b: number, k: number) => {\n  switch (k) {\n    case a > b: return 1;\n    case 1: return 0;\n  }\n};`,
        violations: 0,
      },
      {
        name: "defaultBetweenBlocks",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 2: return 1;\n    default: return 0;\n    case 1: return 3;\n  }\n};`,
        violations: 1,
      },
      {
        fixed: `export const f = (k: string) => {\n  switch (k) {\n    case "a": return 2;\n    case "b": return 1;\n  }\n};`,
        name: "stringLabels",
        source: `export const f = (k: string) => {\n  switch (k) {\n    case "b": return 1;\n    case "a": return 2;\n  }\n};`,
        violations: 1,
      },
      {
        name: "blockBodyReturnFound",
        source: `export const f = (k: number) => {\n  switch (k) {\n    case 2: { return 1; }\n    case 1: return 0;\n  }\n};`,
        violations: 1,
      },
      {
        fixed: `export const f = (k: number) => {
  switch (k) {
    case (1):
    default: return 0;
  }
};`,
        name: "defaultBeforeParenthesizedTest",
        source: `export const f = (k: number) => {
  switch (k) {
    default:
    case (1): return 0;
  }
};`,
        violations: 1,
      },
      {
        fixed: `export const f = (k: number) => {
  switch (k) {
    case 1: return 0;
    case 2: return 1; // about 2
  }
};`,
        name: "blockTrailingCommentStaysWithBlock",
        source: `export const f = (k: number) => {
  switch (k) {
    case 2: return 1; // about 2
    case 1: return 0;
  }
};`,
        violations: 1,
      },
      {
        name: "impureTestKeepsBlocksAsWritten",
        source: `export const f = (k: number) => {
  switch (k) {
    case f(): return 1;
    case 1: return 0;
  }
};`,
        violations: 0,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-switch-case"],
  });
});
