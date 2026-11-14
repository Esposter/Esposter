import { aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { ZERO_UUID } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("aItemEntitySchema", () => {
  test("an id of another version is refused", () => {
    expect.hasAssertions();

    // The real id with only its version digit moved to 7
    const realId = v7();
    const versionSevenId = `${realId.slice(0, 14)}7${realId.slice(15)}`;

    expect(aItemEntitySchema.shape.id.safeParse(versionSevenId).success).toBe(false);
  });

  test("a fixed id passes", () => {
    expect.hasAssertions();

    expect(aItemEntitySchema.shape.id.safeParse(ZERO_UUID).success).toBe(true);
    expect(aItemEntitySchema.shape.id.safeParse("00000000-0000-0000-0000-000000000000").success).toBe(false);
  });

  test("a real id passes", () => {
    expect.hasAssertions();

    expect(aItemEntitySchema.shape.id.safeParse(v7()).success).toBe(true);
  });
});
