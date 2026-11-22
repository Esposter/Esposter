import type { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import type { Page } from "playwright";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { solveReferenceShadows } from "#src/services/genshinParity/witness/solveReferenceShadows";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test, vi } from "vitest";

const { close, getReferencePath } = vi.hoisted(() => ({
  close: vi.fn<() => Promise<void>>(),
  getReferencePath: vi.fn<(referenceId: string) => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinParity/shared/fetchReferences"), () => ({
  fetchReferences: vi.fn<() => Promise<void>>(),
}));
vi.mock(import("#src/services/genshinParity/shared/getReferencePath"), () => ({ getReferencePath }));
vi.mock(import("#src/services/genshinParity/shared/openWitnessPage"), () => ({
  openWitnessPage: vi.fn<typeof openWitnessPage>(() =>
    Promise.resolve({
      checkIsScored: () => true,
      close,
      height: 0,
      image: Buffer.alloc(0),
      page: {} as unknown as Page,
    }),
  ),
}));

describe(solveReferenceShadows, () => {
  test("closes its page when the reference's size cannot be read", async () => {
    expect.hasAssertions();

    getReferencePath.mockResolvedValue(TEST_FILENAME);

    await expect(
      solveReferenceShadows("-1", DerivedAssetComponent.Inazuma, { isSolved: false }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Input file is missing: a]`);
    expect(close).toHaveBeenCalledExactlyOnceWith();
  });
});
