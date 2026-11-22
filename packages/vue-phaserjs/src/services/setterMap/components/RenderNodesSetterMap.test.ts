import { RenderNodesSetter } from "#src/models/setterMap/components/RenderNodesSetter";
import { RenderNodesSetterMap } from "#src/services/setterMap/components/RenderNodesSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, assert, describe, expect, test } from "vitest";

describe("renderNodesSetterMap", () => {
  const sceneKey = "sceneKey";

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test.each([
    RenderNodesSetter.CustomRenderNodes,
    RenderNodesSetter.DefaultRenderNodes,
    RenderNodesSetter.RenderNodeData,
  ])("%s is written to the game object", (setter) => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const graphics = scene.add.graphics();
    const setValue = RenderNodesSetterMap[setter];
    assert.exists(setValue);
    const value = { isConfigured: true };
    setValue(graphics)(value);

    expect(graphics[setter]).toBe(value);
  });
});
