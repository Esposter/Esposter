import { createSkinnedMeshFinder } from "#src/services/character/createSkinnedMeshFinder";
import { Group, SkinnedMesh } from "three";
import { describe, expect, test } from "vitest";

describe(createSkinnedMeshFinder, () => {
  test("finds a skinned mesh a model attaches to the body after the first look", () => {
    expect.hasAssertions();

    const body = new Group();
    const skinnedMeshFinder = createSkinnedMeshFinder(body);
    expect(skinnedMeshFinder.find()).toBeUndefined();

    const skinnedMesh = new SkinnedMesh();
    body.add(skinnedMesh);
    expect(skinnedMeshFinder.find()).toBe(skinnedMesh);
  });

  test("finds a skinned mesh attached under a model that arrives after the first look", () => {
    expect.hasAssertions();

    const body = new Group();
    const skinnedMeshFinder = createSkinnedMeshFinder(body);
    expect(skinnedMeshFinder.find()).toBeUndefined();

    const model = new Group();
    body.add(model);
    expect(skinnedMeshFinder.find()).toBeUndefined();

    const skinnedMesh = new SkinnedMesh();
    model.add(skinnedMesh);
    expect(skinnedMeshFinder.find()).toBe(skinnedMesh);
  });

  test("finds none once a skinned mesh under a model is taken away", () => {
    expect.hasAssertions();

    const body = new Group();
    const model = new Group();
    const skinnedMesh = new SkinnedMesh();
    model.add(skinnedMesh);
    body.add(model);
    const skinnedMeshFinder = createSkinnedMeshFinder(body);
    expect(skinnedMeshFinder.find()).toBe(skinnedMesh);

    model.remove(skinnedMesh);
    expect(skinnedMeshFinder.find()).toBeUndefined();
  });

  test("finds none once the model is taken away from the body", () => {
    expect.hasAssertions();

    const body = new Group();
    const skinnedMesh = new SkinnedMesh();
    body.add(skinnedMesh);
    const skinnedMeshFinder = createSkinnedMeshFinder(body);
    expect(skinnedMeshFinder.find()).toBe(skinnedMesh);

    body.remove(skinnedMesh);
    expect(skinnedMeshFinder.find()).toBeUndefined();
  });
});
