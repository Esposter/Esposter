// @vitest-environment nuxt
import GenshinDevConsole from "@/components/Genshin/Dev/Console/Index.vue";
import GenshinDev from "@/components/Genshin/Dev/Index.vue";
import GenshinDevPanel from "@/components/Genshin/Dev/Panel/Index.vue";
import GenshinWorld from "@/components/Genshin/World.vue";
import { useGenshinDevSaveCommands } from "@/composables/genshin/useGenshinDevSaveCommands";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/composables/genshin/useGenshinDevSaveCommands"), () => ({
  useGenshinDevSaveCommands: vi.fn<typeof useGenshinDevSaveCommands>(),
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
    vi.restoreAllMocks();
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
