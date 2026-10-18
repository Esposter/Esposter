import type { HomePlacement } from "#src/models/home/HomePlacement";

import { props, variants } from "#src/components/World/Realm/PlacementEditor/Index.fixture";
import PlacementEditorContainer from "#src/components/World/Realm/PlacementEditor/Index.vue";
import { GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("placementEditor", () => {
  // A held furnishing picked and placed where the area has load to spare: the placement is emitted whole
  test("a furnishing that fits is placed where it was picked", async () => {
    expect.hasAssertions();

    const onPlace = vi.fn<(placement: HomePlacement) => void>();
    render(PlacementEditorContainer, { props, onPlace });

    await page.getByText("Chair", { exact: true }).click();
    await page.getByRole("button", { name: props.gameText[GameTextKey.Confirm] }).click();

    expect(onPlace.mock.calls[0]?.[0]).toStrictEqual({
      areaId: props.area.areaId,
      furnishingItemId: 1001,
      position: props.position,
      rotation: props.rotation,
      sceneId: props.area.sceneId,
    });
  });

  // A chair past the area's load limit: the meter reads red and the placement button is disabled, nothing is emitted
  test("a furnishing past the area's load is refused", async () => {
    expect.hasAssertions();

    const onPlace = vi.fn<(placement: HomePlacement) => void>();
    render(PlacementEditorContainer, { props: { ...props, ...variants.atLoad }, onPlace });

    await page.getByText("Chair", { exact: true }).click();

    await expect.element(page.getByRole("button", { name: props.gameText[GameTextKey.Confirm] })).toBeDisabled();
    expect(onPlace).not.toHaveBeenCalled();
  });
});
