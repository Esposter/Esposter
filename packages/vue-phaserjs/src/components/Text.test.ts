import Text from "@/components/Text.vue";
import { useTextStore } from "@/store/text";
import { startTestScene } from "@/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "@/test/fixtures/setupGameObjectSuite.test";
import { GameObjects } from "phaser";
import { assert, describe, expect, test } from "vitest";

describe("text", () => {
  const { mountGameObject, sceneKey } = setupGameObjectSuite();

  test("merges defaultTextStyle from store with the provided style", () => {
    expect.hasAssertions();

    mountGameObject(Text, {
      props: {
        configuration: { style: { fontSize: "24px" }, text: "", x: 0, y: 0 },
      },
    });

    const textStore = useTextStore();
    textStore.defaultTextStyle = { color: "#ff0000", fontSize: "16px" };

    const scene = startTestScene(sceneKey);
    const capturedText = scene.children.list.find((gameObject) => gameObject instanceof GameObjects.Text);

    assert.exists(capturedText);

    // Provided style.fontSize overrides the default
    expect(capturedText.style.fontSize).toBe("24px");

    textStore.defaultTextStyle = undefined;
  });
});
