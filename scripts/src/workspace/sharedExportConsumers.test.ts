import { readSharedExportFindings } from "#src/services/sweeps/sharedExportConsumers/readSharedExportFindings";
import { describe, expect, test } from "vitest";

/**
 * The `file-organization` skill's ≥2-consumers rule — a shared package is for code two packages read — held over
 * every export of `packages/shared`. The scan is the `ai:sweep:shared-export-consumers` pass's own: an export the
 * package's other files read is a piece of one that clears the threshold and stays, so what is reported is only
 * the export one package alone names, which belongs beside it, or none does, which is dead.
 */
describe("sharedExportConsumers", () => {
  test("no export of packages/shared is named by fewer than two packages", () => {
    expect.hasAssertions();

    expect(readSharedExportFindings()).toStrictEqual([]);
  });
});
