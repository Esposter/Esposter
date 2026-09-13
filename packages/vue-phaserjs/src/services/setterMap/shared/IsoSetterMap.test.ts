import { IsoBoxSetterMap } from "#src/services/setterMap/IsoBoxSetterMap";
import { IsoTriangleSetterMap } from "#src/services/setterMap/IsoTriangleSetterMap";
import { IsoSetterMap } from "#src/services/setterMap/shared/IsoSetterMap";
import { describe, expect, test } from "vitest";

describe("isoSetterMap", () => {
  test.each(Object.entries(IsoSetterMap))("carries %s into both isometric setter maps", (key, setter) => {
    expect.hasAssertions();

    expect(IsoBoxSetterMap[key as keyof typeof IsoBoxSetterMap]).toBe(setter);
    expect(IsoTriangleSetterMap[key as keyof typeof IsoTriangleSetterMap]).toBe(setter);
  });
});
