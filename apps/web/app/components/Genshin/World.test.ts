// @vitest-environment nuxt
import GenshinDevConsole from "#src/components/Genshin/Dev/Console/Index.vue";
import GenshinDev from "#src/components/Genshin/Dev/Index.vue";
import GenshinDevPanel from "#src/components/Genshin/Dev/Panel/Index.vue";
import GenshinWorld from "#src/components/Genshin/World.vue";
import { useGenshinDevSaveCommands } from "#src/composables/genshin/useGenshinDevSaveCommands";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";
import { WorldScreen } from "genshin-world";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/composables/genshin/useGenshinDevSaveCommands"), () => ({
  useGenshinDevSaveCommands: vi.fn<typeof useGenshinDevSaveCommands>(),
}));

// The build mode the declared environment sets, which the test reads through a getter so one case can declare a
// Development build while Nuxt's own development flag stays off, as it does in a production build
const declaredMode = vi.hoisted(() => ({ isDevelopment: false }));
vi.mock(import("#shared/util/environment/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  get IS_DEVELOPMENT() {
    return declaredMode.isDevelopment;
  },
}));

// The developer surface on its own, since the world mounts none where the test environment strips its block
const mountDevSurface = () =>
  mountSuspended(GenshinDev, {
    props: {
      applySave: noop,
      gameDataBaseUrl: "",
      gameText: ENGLISH_GAME_TEXT,
      getSave: () => EMPTY_GENSHIN_SAVE,
      language: GameLanguage.English,
    },
  });

describe("genshinWorld", () => {
  const serverClockOffsetMs = 0;

  // Nuxt strips the `DevOnly` block that mounts the developer surface out of a template in a production build, and the
  // Unit environment compiles its templates the same way, so the world mounts no surface here. The development cases
  // Mount the surface on its own
  const mountWorld = () =>
    mountSuspended(GenshinWorld, {
      global: { stubs: { WorldScreen: true } },
      props: {
        gameText: ENGLISH_GAME_TEXT,
        isHeld: false,
        isPaused: false,
        language: GameLanguage.English,
        save: EMPTY_GENSHIN_SAVE,
        serverClockOffsetMs,
      },
    });

  afterEach(() => {
    Reflect.deleteProperty(window, "__dev");
    declaredMode.isDevelopment = false;
    vi.restoreAllMocks();
  });

  test("a build declared development mounts the world with no scene exports and no tuning", async () => {
    expect.hasAssertions();

    declaredMode.isDevelopment = true;
    const component = await mountWorld();
    await flushPromises();

    const worldScreen = component.findComponent(WorldScreen);
    expect(worldScreen.exists()).toBe(true);
    expect(worldScreen.props("sceneExportBaseUrl")).toBe("");
    expect(worldScreen.props("isTuning")).toBe(false);
  });

  test("development build offers the console and the panel", async () => {
    expect.hasAssertions();

    // A happy-dom window reports every browser as automated, so a person's browser is stubbed as one
    vi.spyOn(window.navigator, "webdriver", "get").mockReturnValue(false);
    const component = await mountDevSurface();
    await flushPromises();

    expect(component.findComponent(GenshinDevConsole).exists()).toBe(true);
    expect(component.findComponent(GenshinDevPanel).exists()).toBe(true);
    expect(window).not.toHaveProperty("__dev");
  });

  test("production build offers neither", async () => {
    expect.hasAssertions();

    const component = await mountWorld();
    await flushPromises();

    expect(component.findComponent(GenshinDevConsole).exists()).toBe(false);
    expect(component.findComponent(GenshinDevPanel).exists()).toBe(false);
    expect(useGenshinDevSaveCommands).not.toHaveBeenCalled();
    expect(window).not.toHaveProperty("__dev");
  });

  test("browser driven by automation registers commands and mounts no surface", async () => {
    expect.hasAssertions();

    vi.spyOn(window.navigator, "webdriver", "get").mockReturnValue(true);
    const component = await mountDevSurface();
    await flushPromises();

    expect(window).toHaveProperty("__dev.run");
    expect(useGenshinDevSaveCommands).toHaveBeenCalledTimes(1);
    expect(vi.mocked(useGenshinDevSaveCommands).mock.lastCall?.[0].devRegistry).toBeDefined();
    expect(component.findComponent(GenshinDevConsole).exists()).toBe(false);
    expect(component.findComponent(GenshinDevPanel).exists()).toBe(false);
  });
});
