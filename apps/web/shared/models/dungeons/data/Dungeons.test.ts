import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { describe, expect, test } from "vitest";

describe("dungeonsSchema", () => {
  // StructuredClone both sides: zod passes nested class instances through while the clone is plain objects
  test("parses the single-save shape", () => {
    expect.hasAssertions();

    const dungeons = new Dungeons({ save: new Save() });

    expect(structuredClone(dungeonsSchema.parse(dungeons))).toStrictEqual(structuredClone(dungeons));
  });
});
