import type { HudFrame } from "#src/models/hud/HudFrame";

import HudSheerCold from "#src/components/Hud/SheerCold/Index.vue";
import { SHEER_COLD_MAXIMUM } from "#src/services/sheerCold/constants";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { assert, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

const frame: HudFrame = { gadgetCooldown: 0, pivotX: 0.5, pivotY: 0.5, seconds: 0, sheerCold: 0, stamina: 0 };

describe("hudSheerCold", () => {
  // The bar is filled by the gauge's share of its full scale: a quarter of the gauge fills a quarter of the bar
  test("show the bar while the gauge holds cold", async () => {
    expect.hasAssertions();
    const SHEER_COLD_VALUE = SHEER_COLD_MAXIMUM / 4;

    await render(HudSheerCold, {
      props: { frame: { ...frame, sheerCold: SHEER_COLD_VALUE }, gameText: ENGLISH_GAME_TEXT },
    });
    const fill = document.querySelector<HTMLElement>(".sheer-cold .fill");
    assert.exists(fill);

    await expect.element(page.getByRole("meter")).toHaveStyle({ opacity: "1" });
    expect(fill.style.width).toBe("25%");
  });

  test("label the bar with the game's name for the gauge", async () => {
    expect.hasAssertions();

    await render(HudSheerCold, {
      props: { frame: { ...frame, sheerCold: SHEER_COLD_MAXIMUM }, gameText: ENGLISH_GAME_TEXT },
    });

    await expect.element(page.getByRole("meter", { name: "Sheer Cold" })).toBeInTheDocument();
  });
});
