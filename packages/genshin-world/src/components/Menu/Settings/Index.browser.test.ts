import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { props } from "#src/components/Menu/Settings/Index.fixture";
import MenuSettings from "#src/components/Menu/Settings/Index.vue";
import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { ENGLISH_GAME_TEXT, GameLanguage, GameTextKey, GameTextLoaderMap, getLanguageDisplayName } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h, ref } from "vue";

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

describe("menuSettings", () => {
  // The Game Language row is the one that opens its list on the Language tab, which holds the game's fifteen languages
  test("the language list holds fifteen languages", async () => {
    expect.hasAssertions();

    render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsLanguage] }).click();
    await page.getByRole("button", { expanded: false }).click();

    await expect.element(page.getByRole("option").first()).toBeInTheDocument();
    expect(page.getByRole("option").elements()).toHaveLength(15);
  });

  // Choosing German in the list sets the screen's labels to the German game text, here the dialog's name
  test("choosing a language changes the screen's labels", async () => {
    expect.hasAssertions();

    render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsLanguage] }).click();
    await page.getByRole("button", { expanded: false }).click();
    await page.getByRole("option", { name: getLanguageDisplayName(GameLanguage.German, GameLanguage.German) }).click();
    const germanText = await GameTextLoaderMap[GameLanguage.German]();

    await expect.element(page.getByRole("dialog", { name: germanText[GameTextKey.Settings] })).toBeInTheDocument();
  });

  // The FPS row is one the world does not back, so it is drawn disabled at the value the clip shows, 60
  test("a row the world does not back is drawn disabled", async () => {
    expect.hasAssertions();

    render(MenuSettings, { props });
    const fps = page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsFps] });

    await expect.element(fps).toBeDisabled();
    await expect.element(fps).toHaveTextContent("60");
  });

  // The Default Camera Distance row is one the world backs: an arrow key steps it by its range's step, and the row reads the
  // New distance to one decimal place, from the 5.0 the follow camera starts at
  test("the default camera distance steps from the keyboard", async () => {
    expect.hasAssertions();

    render(SettingsHost);
    await page.getByRole("tab", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsControls] }).click();
    const distance = page.getByRole("slider", { name: ENGLISH_GAME_TEXT[GameTextKey.SettingsDefaultCameraDistance] });

    await expect.element(distance).toBeInTheDocument();
    distance.element().dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));

    await expect.element(page.getByText("5.1", { exact: true })).toBeInTheDocument();
  });
});
