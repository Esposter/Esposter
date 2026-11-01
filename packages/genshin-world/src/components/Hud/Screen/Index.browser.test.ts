import { props } from "#src/components/Hud/Screen/Index.fixture";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import { TOUCH_STICK_CLEARANCE_X } from "#src/services/hud/constants";
import { assert, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { cdp, page } from "vitest/browser";

describe("hudScreen", () => {
  test("a character trial's countdown shows the seconds its clock has left", async () => {
    expect.hasAssertions();

    await render(HudScreen, { props: { ...props, trialSecondsRemaining: 299 } });

    await expect.element(page.getByText("4:59", { exact: true })).toBeVisible();
  });

  test("the world shows no countdown outside a trial", async () => {
    expect.hasAssertions();

    await render(HudScreen, { props });

    expect(page.getByText(/^\d+:\d{2}$/u).query()).toBeNull();
  });

  test("a finger landing on the left half shows the stick there until it lifts", async () => {
    expect.hasAssertions();

    await render(HudScreen, { props });
    const stickGroup = document.querySelector(".area > .group");
    assert.exists(stickGroup);

    const landingX = window.innerWidth / 4;
    const landingY = window.innerHeight * 0.6;
    await cdp().send("Input.dispatchMouseEvent", {
      button: "left",
      buttons: 1,
      clickCount: 1,
      type: "mousePressed",
      x: landingX,
      y: landingY,
    });

    await expect.element(page.elementLocator(stickGroup)).toHaveStyle({ opacity: "1" });
    const { width, x } = stickGroup.getBoundingClientRect();
    expect(x + width / 2).toBeCloseTo(landingX, 0);

    await cdp().send("Input.dispatchMouseEvent", {
      button: "left",
      buttons: 0,
      clickCount: 1,
      type: "mouseReleased",
      x: landingX,
      y: landingY,
    });

    await expect.element(page.elementLocator(stickGroup)).toHaveStyle({ opacity: "0" });
  });

  test("a finger landing at the screen's left edge stands the stick clear of the edge", async () => {
    expect.hasAssertions();

    await render(HudScreen, { props });
    const stickGroup = document.querySelector(".area > .group");
    assert.exists(stickGroup);

    await cdp().send("Input.dispatchMouseEvent", {
      button: "left",
      buttons: 1,
      clickCount: 1,
      type: "mousePressed",
      x: 0,
      y: window.innerHeight * 0.6,
    });

    await expect.element(page.elementLocator(stickGroup)).toHaveStyle({ opacity: "1" });
    const [backSize = 0] = props.interfaceRects[HudInterfaceRectName.MoveJoystickGroup].size;
    const { width, x } = stickGroup.getBoundingClientRect();
    expect(x + width / 2).toBeCloseTo(TOUCH_STICK_CLEARANCE_X * (width / backSize), 0);

    await cdp().send("Input.dispatchMouseEvent", {
      button: "left",
      buttons: 0,
      clickCount: 1,
      type: "mouseReleased",
      x: 0,
      y: window.innerHeight * 0.6,
    });
  });
});
