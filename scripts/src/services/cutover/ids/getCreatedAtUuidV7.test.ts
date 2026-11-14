import { getCreatedAtUuidV7 } from "#src/services/cutover/ids/getCreatedAtUuidV7";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(getCreatedAtUuidV7, () => {
  const createdAt = new Date(1700000000123);

  test("is a UUIDv7 whose timestamp is the row's own createdAt", () => {
    expect.hasAssertions();

    const id = getCreatedAtUuidV7(createdAt);

    expect(z.uuidv7().safeParse(id).success).toBe(true);
    expect(Number.parseInt(id.replaceAll("-", "").slice(0, 12), 16)).toBe(createdAt.getTime());
  });

  test("gives two rows made in the same millisecond distinct ids", () => {
    expect.hasAssertions();

    expect(getCreatedAtUuidV7(createdAt)).not.toBe(getCreatedAtUuidV7(createdAt));
  });
});
