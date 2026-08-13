import { IsoBoxSetterMap } from "@/util/setterMap/IsoBoxSetterMap";
import { IsoTriangleSetterMap } from "@/util/setterMap/IsoTriangleSetterMap";
import { IsoSetterMap } from "@/util/setterMap/shared/IsoSetterMap";
import { describe, expect, test } from "vitest";

describe("isoSetterMap", () => {
  test("carries every isometric setter into both isometric setter maps", () => {
    expect.hasAssertions();

    for (const [key, setter] of Object.entries(IsoSetterMap)) {
      expect(IsoBoxSetterMap[key as keyof typeof IsoBoxSetterMap]).toBe(setter);
      expect(IsoTriangleSetterMap[key as keyof typeof IsoTriangleSetterMap]).toBe(setter);
    }
  });
});
