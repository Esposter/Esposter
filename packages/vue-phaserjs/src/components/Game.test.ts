import Game from "#src/components/Game.vue";
import { usePhaserStore } from "#src/store/index";
import { mount } from "@vue/test-utils";
import { Core, HEADLESS } from "phaser";
import { createPinia, setActivePinia } from "pinia";
import { assert, describe, expect, test } from "vitest";

describe("game", () => {
  test("unmounting before the textures are ready destroys the game once Phaser is ready", async () => {
    expect.hasAssertions();

    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(Game, {
      global: { plugins: [pinia] },
      props: { configuration: { audio: { noAudio: true }, type: HEADLESS } },
    });
    const phaserStore = usePhaserStore();
    const phaserGame = phaserStore.game;
    assert.exists(phaserGame);
    const destroyed = new Promise((resolve) => {
      phaserGame.events.once(Core.Events.DESTROY, resolve);
    });

    expect(phaserGame.isRunning).toBe(false);

    wrapper.unmount();

    await destroyed;

    expect(phaserStore.game).toBeUndefined();
  });
});
