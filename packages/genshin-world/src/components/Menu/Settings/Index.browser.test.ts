import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { props } from "#src/components/Menu/Settings/Index.fixture";
import MenuSettings from "#src/components/Menu/Settings/Index.vue";
import {
  CAMERA_DISTANCE_RANGE,
  CAMERA_SENSITIVITY_RANGE,
  GENSHIN_SETTINGS_DEFAULTS,
  VOLUME_LEVEL_MAXIMUM,
} from "#src/services/menu/constants";
import { ENGLISH_GAME_TEXT, GameLanguage, GameTextKey, GameTextLoaderMap, getLanguageDisplayName } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h, ref } from "vue";

describe("menuSettings", () => {
  // The screen as its host holds it: the host keeps the settings and hands them back to the screen on every change
  const SettingsHost = defineComponent({
    setup: () => {
      const settings = ref<GenshinSettings>({ ...GENSHIN_SETTINGS_DEFAULTS });
      return () =>
        h(MenuSettings, {
          ...props,
          "onUpdate:settings": (value: GenshinSettings) => {
            settings.value = value;
          },
          settings: settings.value,
        });
    },
  });
  const leftArrow = { bubbles: true, key: "ArrowLeft" };
  const rightArrow = { bubbles: true, key: "ArrowRight" };

  // The Game Language row is the one that opens its list on the Language tab, which holds the game's fifteen languages
  test("the language list holds fifteen languages", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsLanguage] }).click();
    await page.getByRole("button", { expanded: false }).click();

    await expect.element(page.getByRole("option").first()).toBeInTheDocument();
    expect(page.getByRole("option").elements()).toHaveLength(15);
  });

  // Choosing German in the list sets the screen's labels to the German game text, here the dialog's name
  test("choosing a language changes the screen's labels", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsLanguage] }).click();
    await page.getByRole("button", { expanded: false }).click();
    await page.getByRole("option", { name: getLanguageDisplayName(GameLanguage.German, GameLanguage.German) }).click();
    const germanText = await GameTextLoaderMap[GameLanguage.German]();

    await expect.element(page.getByRole("dialog", { name: germanText[GameTextKey.Settings] })).toBeInTheDocument();
  });

  // The FPS row is one the world does not back, so it is drawn disabled at the value the clip shows, 60
  test("a row the world does not back is drawn disabled", async () => {
    expect.hasAssertions();

    await render(MenuSettings, { props });
    const fps = page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsFps] });

    await expect.element(fps).toBeDisabled();
    await expect.element(fps).toHaveTextContent("60");
  });

  // The Default Camera Distance row is one the world backs: an arrow key steps it by its range's step, and the row reads the
  // New distance to one decimal place, from the default distance the follow camera starts at
  test("the default camera distance steps from the keyboard", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsControls] }).click();
    const distance = page.getByRole("slider", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsDefaultCameraDistance] });

    await expect.element(distance).toBeInTheDocument();
    distance.element().dispatchEvent(new KeyboardEvent("keydown", rightArrow));

    const { step } = CAMERA_DISTANCE_RANGE;
    const steppedDistance = (GENSHIN_SETTINGS_DEFAULTS.defaultDistance + step).toFixed(1);

    await expect.element(page.getByText(steppedDistance, { exact: true })).toBeInTheDocument();
  });

  // The Y-Axis Reset row is a switch: a click flips the value it shows between Off and On
  test("the Y-axis reset switch flips between Off and On", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsControls] }).click();
    const yAxisReset = page.getByRole("button", {
      exact: true,
      name: ENGLISH_GAME_TEXT[GameTextKey.SettingsCameraYAxisReset],
    });

    await expect.element(yAxisReset).toHaveTextContent(ENGLISH_GAME_TEXT[GameTextKey.SettingsOff]);
    await yAxisReset.click();
    await expect.element(yAxisReset).toHaveTextContent(ENGLISH_GAME_TEXT[GameTextKey.SettingsOn]);
  });

  // The camera's two sensitivities step by the arrow keys from the 3 the follow camera starts at, up and down
  test("the horizontal and vertical sensitivities step from the keyboard", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsControls] }).click();
    const horizontal = page.getByRole("slider", {
      exact: true,
      name: ENGLISH_GAME_TEXT[GameTextKey.SettingsHorizontalSensitivity],
    });
    const vertical = page.getByRole("slider", {
      exact: true,
      name: ENGLISH_GAME_TEXT[GameTextKey.SettingsVerticalSensitivity],
    });

    // Each slider's starting value is awaited before its key is sent, so the key lands on the row the tab has drawn
    await expect
      .element(horizontal)
      .toHaveAttribute("aria-valuenow", String(GENSHIN_SETTINGS_DEFAULTS.horizontalSensitivity));
    horizontal.element().dispatchEvent(new KeyboardEvent("keydown", rightArrow));
    await expect
      .element(vertical)
      .toHaveAttribute("aria-valuenow", String(GENSHIN_SETTINGS_DEFAULTS.verticalSensitivity));
    vertical.element().dispatchEvent(new KeyboardEvent("keydown", leftArrow));

    const { step } = CAMERA_SENSITIVITY_RANGE;
    await expect
      .element(horizontal)
      .toHaveAttribute("aria-valuenow", String(GENSHIN_SETTINGS_DEFAULTS.horizontalSensitivity + step));
    await expect
      .element(vertical)
      .toHaveAttribute("aria-valuenow", String(GENSHIN_SETTINGS_DEFAULTS.verticalSensitivity - step));
  });

  // The Master, Music and Sound Effects volumes step down a level from the maximum the device starts at
  test("the master, music and sound effects volumes step down from the keyboard", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsAudio] }).click();
    const master = page.getByRole("slider", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.SettingsVolume] });
    const music = page.getByRole("slider", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.SettingsMusicVolume] });
    const sfx = page.getByRole("slider", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.SettingsSfxVolume] });

    await expect.element(master).toHaveAttribute("aria-valuenow", String(VOLUME_LEVEL_MAXIMUM));
    master.element().dispatchEvent(new KeyboardEvent("keydown", leftArrow));
    await expect.element(music).toHaveAttribute("aria-valuenow", String(VOLUME_LEVEL_MAXIMUM));
    music.element().dispatchEvent(new KeyboardEvent("keydown", leftArrow));
    await expect.element(sfx).toHaveAttribute("aria-valuenow", String(VOLUME_LEVEL_MAXIMUM));
    sfx.element().dispatchEvent(new KeyboardEvent("keydown", leftArrow));

    await expect.element(master).toHaveAttribute("aria-valuenow", String(VOLUME_LEVEL_MAXIMUM - 1));
    await expect.element(music).toHaveAttribute("aria-valuenow", String(VOLUME_LEVEL_MAXIMUM - 1));
    await expect.element(sfx).toHaveAttribute("aria-valuenow", String(VOLUME_LEVEL_MAXIMUM - 1));
  });

  // The Graphics Quality row opens its list of tiers, and choosing one shows that tier on the row
  test("the graphics quality row lists its tiers and shows the one chosen", async () => {
    expect.hasAssertions();

    await render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsGraphics] }).click();
    const quality = page.getByRole("button", {
      exact: true,
      name: ENGLISH_GAME_TEXT[GameTextKey.SettingsGraphicsQuality],
    });

    await expect.element(quality).toBeInTheDocument();
    await quality.click();

    const option = page.getByRole("option").first();
    await expect.element(option).toBeInTheDocument();
    const chosen = option.element().textContent.trim();
    await option.click();

    await expect.element(quality).toHaveTextContent(chosen);
  });
});
