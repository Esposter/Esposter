import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { describe, expect, test } from "vitest";

describe(Dungeons, () => {
  test("keeps a single save", () => {
    expect.hasAssertions();

    const save = new Save();
    const dungeons = new Dungeons({ save });

    expect(dungeons.save).toStrictEqual(save);
  });
});

describe("dungeonsSchema", () => {
  // StructuredClone both sides: zod passes nested class instances through while the clone is plain objects
  test("parses the single-save shape", () => {
    expect.hasAssertions();

    const dungeons = new Dungeons({ save: new Save() });

    expect(structuredClone(dungeonsSchema.parse(dungeons))).toStrictEqual(structuredClone(dungeons));
  });
});
