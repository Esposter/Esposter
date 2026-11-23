import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_OVERLAY_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedOverlaySyntaxes";
import { describe } from "vitest";

describe("restrictedOverlaySyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_OVERLAY_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "entryForOf.ts",
        name: "entryForOf",
        source:
          "export const getFooEntry = (id: string): Entry => (view) => {\n  for (const row of view) void row;\n};",
        violations: 1,
      },
      {
        filePath: "entrySpread.ts",
        name: "entrySpread",
        source: "export const getFooEntry = (): Entry => (view) => {\n  const rows = [...view];\n};",
        violations: 1,
      },
      {
        filePath: "entryObjectKeys.ts",
        name: "entryObjectKeys",
        source: "export const getFooEntry = (): Entry => (view) => {\n  Object.keys(view);\n};",
        violations: 1,
      },
      {
        filePath: "entryForEach.ts",
        name: "entryForEach",
        source: "export const getFooEntry = (): Entry => (view) => {\n  view.forEach(noop);\n};",
        violations: 1,
      },
      {
        filePath: "entryUnannotatedFactory.ts",
        name: "entryUnannotatedFactory",
        source:
          "export const getFooEntry = (id: string) => (view: KeyedView) => {\n  for (const row of view) void row;\n};",
        violations: 1,
      },
      {
        filePath: "entryKeysAndDestructure.ts",
        name: "entryKeysAndDestructure",
        source:
          "export const getFooEntry = (): Entry => (view) => {\n  for (const key in view) void key;\n  const [first] = view;\n};",
        violations: 2,
      },
      {
        filePath: "entryInlineOption.ts",
        name: "entryInlineOption",
        source:
          "store.writeOptimistic(awaited, {\n  entry: (view) => {\n    for (const row of view) void row;\n  },\n  onError,\n});",
        violations: 1,
      },
      {
        filePath: "entryRefAssign.ts",
        name: "entryRefAssign",
        source: "export const getFooEntry = (): Entry => (view) => {\n  selected.value = view.get(table, [id]);\n};",
        violations: 1,
      },
      {
        filePath: "entryRefUpdate.ts",
        name: "entryRefUpdate",
        source: "export const getFooEntry = (): Entry => (view) => {\n  count.value++;\n};",
        violations: 1,
      },
      {
        filePath: "entryReadsByKey.ts",
        name: "entryReadsByKey",
        source:
          "export const getRenameEntry = (id: string, name: string): Entry => (view) => {\n  const row = view.get(roomTable, [id]);\n  if (row) view.set(roomTable, [id], { ...row, name });\n};",
        violations: 0,
      },
      {
        filePath: "entryHelperFactory.ts",
        name: "entryHelperFactory",
        source:
          "export const getRenameEntry = (id: string, name: string): Entry =>\n  getHeldRowEntry(roomTable, [id], (row) => ({ ...row, name }));",
        violations: 0,
      },
      {
        filePath: "entryIteratesInput.ts",
        name: "entryIteratesInput",
        source:
          "export const getReorderEntry = (updates: Update[]): Entry => (view) => {\n  for (const { id, position } of updates) view.set(categoryTable, [id], { id, position });\n};",
        violations: 0,
      },
      {
        filePath: "entryOptionCallee.ts",
        name: "entryOptionCallee",
        source: "store.writeOptimistic(awaited, { entry: getFooEntry(id), onError });",
        violations: 0,
      },
      {
        filePath: "nonEntryIteratesView.ts",
        name: "nonEntryIteratesView",
        source:
          "export const countRows = (view: Row[]) => {\n  let count = 0;\n  for (const row of view) count += row.length;\n  return count;\n};",
        violations: 0,
      },
      {
        filePath: "nonEntryRefAssign.ts",
        name: "nonEntryRefAssign",
        source: "const isOpen = ref(false);\nisOpen.value = true;",
        violations: 0,
      },
    ],
  });
});
