import type { readProducerStaleness as baseReadProducerStaleness } from "#src/services/producerStamp/readProducerStaleness";
import type { readFile as baseReadFile } from "node:fs/promises";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { describe, expect, test, vi } from "vitest";

const { readProducerStaleness } = vi.hoisted(() => ({
  readProducerStaleness: vi.fn<typeof baseReadProducerStaleness>(),
}));

vi.mock(import("#src/services/producerStamp/readProducerStaleness"), () => ({ readProducerStaleness }));
vi.mock(import("node:fs"), () => ({ existsSync: () => true }));
vi.mock(import("node:fs/promises"), () => ({
  readFile: (() => Promise.resolve("{}")) as unknown as typeof baseReadFile,
}));

describe(readWorldOptions, () => {
  test("checks a derived world's producer once across concurrent reads, and again after a check that failed", async () => {
    expect.hasAssertions();

    readProducerStaleness.mockRejectedValueOnce(new Error("a"));

    await expect(readWorldOptions(DerivedAssetComponent.Fontaine)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: a]`,
    );

    readProducerStaleness.mockResolvedValue({ commits: [], isApproximate: false });
    await Promise.all([
      readWorldOptions(DerivedAssetComponent.Fontaine),
      readWorldOptions(DerivedAssetComponent.Fontaine),
    ]);
    await readWorldOptions(DerivedAssetComponent.Fontaine);

    expect(readProducerStaleness).toHaveBeenCalledTimes(2);
  });
});
