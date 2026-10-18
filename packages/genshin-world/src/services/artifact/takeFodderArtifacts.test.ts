import { FLOWER_ITEM_DEFINITION } from "#src/services/artifact/constants.test";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { takeFodderArtifacts } from "#src/services/artifact/takeFodderArtifacts";
import { describe, expect, test } from "vitest";

describe(takeFodderArtifacts, () => {
  test("the fodders are taken out of the bag and the entries not picked stay in it", () => {
    expect.hasAssertions();

    const kept = createArtifact();
    expect(
      takeFodderArtifacts(
        {
          items: [
            { artifact: createArtifact(), definition: FLOWER_ITEM_DEFINITION, id: 0, quantity: 1 },
            { artifact: kept, definition: FLOWER_ITEM_DEFINITION, id: 1, quantity: 1 },
          ],
          nextId: 2,
          quickSwapItemIds: [],
        },
        [0],
      ),
    ).toStrictEqual({
      items: [{ artifact: kept, definition: FLOWER_ITEM_DEFINITION, id: 1, quantity: 1 }],
      nextId: 2,
      quickSwapItemIds: [],
    });
  });

  test("a locked artifact is refused as fodder", () => {
    expect.hasAssertions();

    expect(() =>
      takeFodderArtifacts(
        {
          items: [
            { artifact: createArtifact({ isLocked: true }), definition: FLOWER_ITEM_DEFINITION, id: 0, quantity: 1 },
          ],
          nextId: 1,
          quickSwapItemIds: [],
        },
        [0],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: takeFodderArtifacts, entry 0 is not an unlocked artifact]`,
    );
  });

  test("an entry that is not an artifact is refused as fodder", () => {
    expect.hasAssertions();

    expect(() =>
      takeFodderArtifacts(
        { items: [{ definition: FLOWER_ITEM_DEFINITION, id: 2, quantity: 3 }], nextId: 3, quickSwapItemIds: [] },
        [2],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: takeFodderArtifacts, entry 2 is not an unlocked artifact]`,
    );
  });
});
