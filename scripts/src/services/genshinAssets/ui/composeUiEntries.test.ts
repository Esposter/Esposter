import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";
import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";
import type { UiRectTransformRead } from "#src/models/genshinAssets/ui/UiRectTransformRead";

import { ScreenMatchMode } from "#src/models/genshinAssets/ui/ScreenMatchMode";
import { UiScaleMode } from "#src/models/genshinAssets/ui/UiScaleMode";
import { composeUiEntries } from "#src/services/genshinAssets/ui/composeUiEntries";
import { describe, expect, test } from "vitest";

const createGameObject = (
  name: string,
  transformId: string,
  gameObjectId: string,
  components: string[] = [],
): DumpedGameObject => ({
  m_Components: [
    { m_PathID: transformId, Name: "" },
    ...components.map((componentName) => ({ m_PathID: `${gameObjectId}-${componentName}`, Name: componentName })),
  ],
  m_Name: name,
  m_Transform: { m_GameObject: { m_PathID: gameObjectId } },
});

describe(composeUiEntries, () => {
  const BLOCK = "00/04949489.blk";
  const CONTAINER = "-1001859426";
  const layout: DumpedRectTransform = {
    anchoredPosition: [0, 0],
    anchorMax: [1, 1],
    anchorMin: [0, 0],
    pivot: [0.5, 0.5],
    sizeDelta: [0, 0],
  };
  const createRectTransform = (
    name: string,
    gameObjectId: string,
    fatherId: string,
    childIds: string[] = [],
  ): UiRectTransformRead => ({ childIds, container: CONTAINER, fatherId, gameObjectId, layout, name, scale: [1, 1] });

  test("keeps two same-named objects of one container apart by their GameObjects, and walks their path up the father links", () => {
    expect.hasAssertions();

    const entries = composeUiEntries(
      BLOCK,
      [
        createRectTransform("Root", "root-object", "", ["root-child-transform", "root-repeat-transform"]),
        createRectTransform("Btn", "btn-object", "root-transform"),
        createRectTransform("Btn (1)", "btn-repeat-object", "root-transform"),
      ],
      [
        createGameObject("Root", "root-transform", "root-object", ["CanvasScaler"]),
        createGameObject("Btn", "btn-transform", "btn-object", ["Button"]),
        createGameObject("Btn (1)", "btn-repeat-transform", "btn-repeat-object"),
      ],
      new Map([
        [
          "root-object",
          {
            matchWidthOrHeight: 0.5,
            referenceResolution: [1920, 1080],
            screenMatchMode: ScreenMatchMode.MatchWidthOrHeight,
            uiScaleMode: UiScaleMode.ScaleWithScreenSize,
          },
        ],
      ]),
    );

    expect(entries.map(({ name, path, pathId, transformId }) => ({ name, path, pathId, transformId }))).toStrictEqual([
      { name: "Root", path: [], pathId: "root-object", transformId: "root-transform" },
      { name: "Btn", path: ["Root"], pathId: "btn-object", transformId: "btn-transform" },
      { name: "Btn (1)", path: ["Root"], pathId: "btn-repeat-object", transformId: "btn-repeat-transform" },
    ]);
    expect(entries[0]?.canvas).toStrictEqual({
      matchWidthOrHeight: 0.5,
      referenceResolution: [1920, 1080],
      screenMatchMode: ScreenMatchMode.MatchWidthOrHeight,
      uiScaleMode: UiScaleMode.ScaleWithScreenSize,
    });
    expect(entries[1]?.components).toStrictEqual(["Button"]);
  });

  test("refuses a GameObject its container names twice rather than keeping one of them", () => {
    expect.hasAssertions();

    expect(() =>
      composeUiEntries(
        BLOCK,
        [createRectTransform("Btn", "btn-object", ""), createRectTransform("Btn", "btn-object", "")],
        [createGameObject("Btn", "btn-transform", "btn-object")],
        new Map(),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: 00/04949489.blk/-1001859426/btn-object, two RectTransforms of one container name one GameObject]`,
    );
  });

  test("keeps a RectTransform whose GameObject dump is lost, with no transform, components or children to link", () => {
    expect.hasAssertions();

    const [entry] = composeUiEntries(
      BLOCK,
      [createRectTransform("Lost", "lost-object", "root-transform")],
      [],
      new Map(),
    );

    expect(entry).toStrictEqual({
      block: BLOCK,
      childIds: [],
      components: [],
      container: CONTAINER,
      fatherId: "root-transform",
      name: "Lost",
      path: [],
      pathId: "lost-object",
      rect: layout,
      scale: [1, 1],
      transformId: "",
    });
  });
});
