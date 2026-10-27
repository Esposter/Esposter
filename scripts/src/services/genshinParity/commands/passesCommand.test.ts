import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { genshinParityCommand } from "#src/services/genshinParity/commands/genshinParityCommand";
import { getParityPassesPath } from "#src/services/genshinParity/passes/getParityPassesPath";
import { runCommand } from "citty";
import { rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { afterAll, afterEach, describe, expect, test, vi } from "vitest";

const { measureInventory, measureLayout, passesDirectory } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  return {
    measureInventory: vi.fn<() => Promise<ParityPassMeasure>>(),
    measureLayout: vi.fn<() => Promise<ParityPassMeasure>>(),
    passesDirectory: join(mkdtempSync(join(tmpdir(), "parity-passes-")), "snapshots"),
  };
});

vi.mock(import("#src/services/genshinParity/passes/ParityPassMeasureMap"), () => ({
  ParityPassMeasureMap: { [ParityPass.Inventory]: measureInventory, [ParityPass.Layout]: measureLayout },
}));
vi.mock(import("#src/services/genshinParity/passes/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  PARITY_PASSES_DIRECTORY: passesDirectory,
}));

describe("passesCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    rmSync(passesDirectory, { force: true, recursive: true });
  });

  test("writes a pass run alone over its own rows, keeping the rest of the component's report", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "log").mockReturnValue(undefined);
    measureInventory.mockResolvedValueOnce({ notes: [], readings: [{ gate: 0, name: "", unit: "", value: 0 }] });
    measureLayout.mockResolvedValueOnce({ notes: [], readings: [{ gate: 0, name: "", unit: "", value: 1 }] });
    await runCommand(genshinParityCommand, { rawArgs: ["passes", DerivedAssetComponent.Liyue] });
    measureInventory.mockResolvedValueOnce({ notes: [], readings: [{ gate: 0, name: "", unit: "", value: 1 }] });
    await runCommand(genshinParityCommand, {
      rawArgs: ["passes", DerivedAssetComponent.Liyue, "--pass", ParityPass.Inventory],
    });

    await expect(readFile(getParityPassesPath(DerivedAssetComponent.Liyue), "utf8")).resolves.toMatchInlineSnapshot(`
      "# liyue

      | Pass | Reading | Value | Gate | Unit | Held |
      | :--- | :------ | ----: | ---: | :--- | :--- |
      | Inventory |  | 1 | 0 |  | no |
      | Layout |  | 1 | 0 |  | no |
      "
    `);
  });
});
