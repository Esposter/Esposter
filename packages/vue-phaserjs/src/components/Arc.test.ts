import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import Arc from "@/components/Arc.vue";
import { getTestPinia, startTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { expectToBeDefined } from "@esposter/shared";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("arc", () => {
  const sceneKey = "sceneKey";

  test("creates an arc game object with the configured radius, startAngle, and endAngle", () => {
    expect.hasAssertions();

    let capturedArc: GameObjects.Arc | undefined;

    const wrapper = mount(Arc, {
      global: {
        plugins: [getTestPinia()],
        provide: {
          [InjectionKeyMap.SceneKey]: sceneKey,
        },
      },
      props: {
        configuration: { endAngle: 0, radius: 0, startAngle: 0, x: 0, y: 0 },
        onComplete: (_scene: SceneWithPlugins, arc: GameObjects.Arc) => {
          capturedArc = arc;
        },
      },
    });

    startTestScene(sceneKey);

    expectToBeDefined(capturedArc);

    expect(capturedArc.radius).toBe(0);
    expect(capturedArc.startAngle).toBe(0);
    expect(capturedArc.endAngle).toBe(0);

    wrapper.unmount();
  });
});
