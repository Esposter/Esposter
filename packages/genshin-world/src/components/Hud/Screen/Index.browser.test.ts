import { props } from "#src/components/Hud/Screen/Index.fixture";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("hudScreen", () => {
  test("a character trial's countdown shows the seconds its clock has left", async () => {
    expect.hasAssertions();

    render(HudScreen, { props: { ...props, trialSecondsRemaining: 299 } });

    await expect.element(page.getByText("4:59", { exact: true })).toBeVisible();
  });

  test("the world shows no countdown outside a trial", () => {
    expect.hasAssertions();

    render(HudScreen, { props });

    expect(page.getByText(/^\d+:\d{2}$/u).query()).toBeNull();
  });
});
