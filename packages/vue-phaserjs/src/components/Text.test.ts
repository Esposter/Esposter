import Text from "@/components/Text.vue";
import { useTextStore } from "@/store/text";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { mount } from "@vue/test-utils";
import { GameObjects } from "phaser";
import { assert, describe, expect, test } from "vitest";

describe("text", () => {
  const sceneKey = "sceneKey";

  test("merges defaultTextStyle from store with the provided style", () => {
    expect.hasAssertions();

    const wrapper = mount(Text, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      props: {
        configuration: { style: { fontSize: "24px" }, text: "", x: 0, y: 0 },
      },
    });

    const textStore = useTextStore();
    textStore.defaultTextStyle = { color: "#ff0000", fontSize: "16px" };

    const scene = startTestScene(sceneKey);
    const capturedText = scene.children.list.find((obj) => obj instanceof GameObjects.Text);

    assert.exists(capturedText);

    // Provided style.fontSize overrides the default
    expect(capturedText.style.fontSize).toBe("24px");

    wrapper.unmount();
    removeTestScene(sceneKey);
    textStore.defaultTextStyle = undefined;
  });
});
