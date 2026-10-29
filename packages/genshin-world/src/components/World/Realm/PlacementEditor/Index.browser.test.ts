import type { HomePlacement } from "#src/models/home/HomePlacement";

import { props, variants } from "#src/components/World/Realm/PlacementEditor/Index.fixture";
import PlacementEditorContainer from "#src/components/World/Realm/PlacementEditor/Index.vue";
import { takeOne } from "@esposter/shared";
import { GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("placementEditor", () => {
  const chair = takeOne(props.held);
  // A held furnishing picked and placed where the area has load to spare: the placement is emitted whole
  test("a furnishing that fits is placed where it was picked", async () => {
    expect.hasAssertions();

    const onPlace = vi.fn<(placement: HomePlacement) => void>();
    await render(PlacementEditorContainer, { attrs: { onPlace }, props });

    await page.getByText(chair.name, { exact: true }).click();
    await page.getByRole("button", { name: props.gameText[GameTextKey.HomeDeploy] }).click();

    expect(onPlace).toHaveBeenCalledExactlyOnceWith({
      areaId: props.area.areaId,
      furnishingItemId: chair.itemId,
      position: props.position,
      rotation: props.rotation,
      sceneId: props.area.sceneId,
    });
  });

  // A chair past the area's load limit: the meter reads red and the placement button is disabled, nothing is emitted
  test("a furnishing past the area's load is refused", async () => {
    expect.hasAssertions();

    const onPlace = vi.fn<(placement: HomePlacement) => void>();
    await render(PlacementEditorContainer, { attrs: { onPlace }, props: { ...props, ...variants.atLoad } });

    await page.getByText(chair.name, { exact: true }).click();

    await expect.element(page.getByRole("button", { name: props.gameText[GameTextKey.HomeDeploy] })).toBeDisabled();
    await expect
      .element(page.getByText(props.gameText[GameTextKey.RetHomeFurnitureExceedLimit], { exact: true }))
      .toBeVisible();
    expect(onPlace).not.toHaveBeenCalled();
  });
});
