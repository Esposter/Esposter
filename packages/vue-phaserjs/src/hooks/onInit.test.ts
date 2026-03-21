import { onCreate } from "@/hooks/onCreate";
import { onInit } from "@/hooks/onInit";
import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test } from "vitest";

describe(onInit, () => {
  const sceneKey = "sceneKey";

  test("fires before create", () => {
    expect.hasAssertions();

    const order: Lifecycle[] = [];
    onInit(() => order.push(Lifecycle.Init), sceneKey);
    onCreate(() => order.push(Lifecycle.Create), sceneKey);
    startTestScene(sceneKey);

    expect(order).toStrictEqual([Lifecycle.Init, Lifecycle.Create]);

    removeTestScene(sceneKey);
  });
});
