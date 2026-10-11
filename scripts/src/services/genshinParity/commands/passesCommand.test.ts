import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { genshinParityCommand } from "#src/services/genshinParity/commands/genshinParityCommand";
import { runCommand } from "citty";
import { rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { afterAll, describe, expect, test, vi } from "vitest";

const { measureInventory, measureLayout, passesPath } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  return {
    measureInventory: vi.fn<() => Promise<ParityPassMeasure>>(),
    measureLayout: vi.fn<() => Promise<ParityPassMeasure>>(),
    passesPath: join(mkdtempSync(join(tmpdir(), "parity-passes-")), "a"),
  };
});

vi.mock(import("#src/services/genshinParity/passes/ParityPassMeasureMap"), () => ({
  ParityPassMeasureMap: { [ParityPass.Inventory]: measureInventory, [ParityPass.Layout]: measureLayout },
}));
vi.mock(import("#src/services/genshinParity/passes/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  PARITY_PASSES_PATH: passesPath,
}));

describe("passesCommand", () => {
  afterAll(() => {
    rmSync(dirname(passesPath), { force: true, recursive: true });
  });

  test("writes a pass run alone over its own rows, keeping the rest of the section", async () => {
    expect.hasAssertions();

    const log = vi.spyOn(console, "log").mockReturnValue(undefined);
    measureInventory.mockResolvedValueOnce({ notes: [], readings: [{ gate: 0, name: "", unit: "", value: 0 }] });
    measureLayout.mockResolvedValueOnce({ notes: [], readings: [{ gate: 0, name: "", unit: "", value: 1 }] });
    await runCommand(genshinParityCommand, { rawArgs: ["passes", DerivedAssetComponent.Liyue] });
    measureInventory.mockResolvedValueOnce({ notes: [], readings: [{ gate: 0, name: "", unit: "", value: 1 }] });
    await runCommand(genshinParityCommand, {
      rawArgs: ["passes", DerivedAssetComponent.Liyue, "--pass", ParityPass.Inventory],
    });
    log.mockRestore();

    await expect(readFile(passesPath, "utf8")).resolves.toMatchInlineSnapshot(`
      "# Parity passes

      Each component's last \`pnpm -C scripts genshin:parity passes <component>\`, which rewrites its own section: every
      pass in order up to the first whose gate fails or that has no measure yet, which is the next work. A pass run alone
      (\`--pass\`) rewrites only its own rows. Commit it with the change that moved it, as a bench's report is committed.

      ## liyue

      | Pass | Reading | Value | Gate | Unit | Held |
      | :--- | :------ | ----: | ---: | :--- | :--- |
      | Inventory |  | 1 | 0 |  | no |
      | Layout |  | 1 | 0 |  | no |
      "
    `);
  });
});
