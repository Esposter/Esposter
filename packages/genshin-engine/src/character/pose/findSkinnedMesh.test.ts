import { createSkinnedMeshFinder } from "#src/character/pose/findSkinnedMesh";
import { Group, SkinnedMesh } from "three";
import { describe, expect, test } from "vitest";

describe(createSkinnedMeshFinder, () => {
  test("a skinned mesh attached under a model that arrives later is found when it arrives", () => {
    expect.hasAssertions();

    const body = new Group();
    const findBodySkinnedMesh = createSkinnedMeshFinder(body);
    const model = new Group();
    const skinnedMesh = new SkinnedMesh();
    model.add(skinnedMesh);

    expect(findBodySkinnedMesh()).toBeUndefined();
    body.add(model);
    expect(findBodySkinnedMesh()).toBe(skinnedMesh);
  });

  test("a skinned mesh attached later under a model already in the body is found", () => {
    expect.hasAssertions();

    const body = new Group();
    const model = new Group();
    body.add(model);
    const findBodySkinnedMesh = createSkinnedMeshFinder(body);
    const skinnedMesh = new SkinnedMesh();

    expect(findBodySkinnedMesh()).toBeUndefined();
    model.add(skinnedMesh);
    expect(findBodySkinnedMesh()).toBe(skinnedMesh);
  });

  test("a skinned mesh taken away with its model is no longer found", () => {
    expect.hasAssertions();

    const body = new Group();
    const model = new Group();
    const skinnedMesh = new SkinnedMesh();
    model.add(skinnedMesh);
    body.add(model);
    const findBodySkinnedMesh = createSkinnedMeshFinder(body);

    expect(findBodySkinnedMesh()).toBe(skinnedMesh);
    body.remove(model);
    expect(findBodySkinnedMesh()).toBeUndefined();
  });

  test("walks the body's tree only when a child is added or removed, not on every call", () => {
    expect.hasAssertions();

    const body = new Group();
    const model = new Group();
    model.add(new SkinnedMesh());
    body.add(model);
    let childReads = 0;
    const { children } = body;
    Object.defineProperty(body, "children", {
      get: () => {
        childReads += 1;
        return children;
      },
    });
    const findBodySkinnedMesh = createSkinnedMeshFinder(body);

    findBodySkinnedMesh();
    const readsAfterFirstWalk = childReads;
    findBodySkinnedMesh();
    findBodySkinnedMesh();
    expect(childReads).toBe(readsAfterFirstWalk);
    body.add(new Group());
    const readsAfterAdd = childReads;
    findBodySkinnedMesh();
    expect(childReads).toBeGreaterThan(readsAfterAdd);
  });
});
