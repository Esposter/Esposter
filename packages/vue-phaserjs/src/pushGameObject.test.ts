import type { GameObjects } from "phaser";

import { pushGameObject } from "@/pushGameObject";
import { describe, expect, test, vi } from "vitest";

const createMockGameObject = (depth?: number) => ({ depth, type: "GameObject" }) as unknown as GameObjects.GameObject;

const createMockContainer = (existingDepths: (number | undefined)[] = []) => {
  const list = existingDepths.map((depth) => createMockGameObject(depth));
  return {
    add: vi.fn<(gameObject: GameObjects.GameObject) => void>(),
    addAt: vi.fn<(gameObject: GameObjects.GameObject, index: number) => void>(),
    list,
  } as unknown as GameObjects.Container;
};

describe(pushGameObject, () => {
  test("appends to end when configuration has no depth", () => {
    expect.hasAssertions();

    const container = createMockContainer([1, 2]);
    const gameObject = createMockGameObject();
    pushGameObject(container, {}, gameObject);

    expect(container.add).toHaveBeenCalledWith(gameObject);
    expect(container.addAt).not.toHaveBeenCalled();
  });

  test("appends to end when container is empty", () => {
    expect.hasAssertions();

    const container = createMockContainer();
    const gameObject = createMockGameObject();
    pushGameObject(container, { depth: 1 }, gameObject);

    expect(container.add).toHaveBeenCalledWith(gameObject);
    expect(container.addAt).not.toHaveBeenCalled();
  });

  test("appends to end when depth is greater than all existing depths", () => {
    expect.hasAssertions();

    const container = createMockContainer([1, 2, 3]);
    const gameObject = createMockGameObject();
    pushGameObject(container, { depth: 5 }, gameObject);

    expect(container.add).toHaveBeenCalledWith(gameObject);
    expect(container.addAt).not.toHaveBeenCalled();
  });

  test("inserts at correct position when depth is between existing depths", () => {
    expect.hasAssertions();

    const container = createMockContainer([1, 3, 5]);
    const gameObject = createMockGameObject();
    pushGameObject(container, { depth: 2 }, gameObject);

    // First item with depth > 2 is at index 1 (depth 3)
    expect(container.addAt).toHaveBeenCalledWith(gameObject, 1);
    expect(container.add).not.toHaveBeenCalled();
  });

  test("inserts at index 0 when depth is less than all existing depths", () => {
    expect.hasAssertions();

    const container = createMockContainer([2, 4, 6]);
    const gameObject = createMockGameObject();
    pushGameObject(container, { depth: 1 }, gameObject);

    expect(container.addAt).toHaveBeenCalledWith(gameObject, 0);
    expect(container.add).not.toHaveBeenCalled();
  });
});
