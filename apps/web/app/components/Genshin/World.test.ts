// @vitest-environment nuxt
import GenshinDevConsole from "@/components/Genshin/Dev/Console/Index.vue";
import GenshinDevPanel from "@/components/Genshin/Dev/Panel/Index.vue";
import GenshinWorld from "@/components/Genshin/World.vue";
import { useGenshinDevSaveCommands } from "@/composables/genshin/useGenshinDevSaveCommands";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const environment = vi.hoisted(() => ({ isDevelopment: true }));

vi.mock(import("#shared/util/environment/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  get IS_DEVELOPMENT() {
    return environment.isDevelopment;
  },
}));
vi.mock(import("@/composables/genshin/useGenshinDevSaveCommands"), () => ({
  useGenshinDevSaveCommands: vi.fn<typeof useGenshinDevSaveCommands>(),
}));

describe("genshinWorld", () => {
  const serverClockOffsetMs = 0;

  const mountWorld = () =>
    mountSuspended(GenshinWorld, {
      global: { stubs: { WorldScreen: true } },
      props: {
        gameText: ENGLISH_GAME_TEXT,
        isPaused: false,
        language: GameLanguage.English,
        save: EMPTY_GENSHIN_SAVE,
        serverClockOffsetMs,
      },
    });

  beforeEach(() => {
    environment.isDevelopment = true;
  });
  afterEach(() => {
    Reflect.deleteProperty(window, "__dev");
    vi.restoreAllMocks();
  });

  test("development build offers the console and the panel", async () => {
    expect.hasAssertions();

    // A happy-dom window reports every browser as automated, so a person's browser is stubbed as one
    vi.spyOn(window.navigator, "webdriver", "get").mockReturnValue(false);
    const component = await mountWorld();
    await flushPromises();

    expect(component.findComponent(GenshinDevConsole).exists()).toBe(true);
    expect(component.findComponent(GenshinDevPanel).exists()).toBe(true);
    expect(window).not.toHaveProperty("__dev");
  });

  test("production build offers neither", async () => {
    expect.hasAssertions();

    environment.isDevelopment = false;
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
    const component = await mountWorld();
    await flushPromises();

    expect(window).toHaveProperty("__dev.run");
    expect(useGenshinDevSaveCommands).toHaveBeenCalledTimes(1);
    expect(vi.mocked(useGenshinDevSaveCommands).mock.lastCall?.[0].devRegistry).toBeDefined();
    expect(component.findComponent(GenshinDevConsole).exists()).toBe(false);
    expect(component.findComponent(GenshinDevPanel).exists()).toBe(false);
  });
});
