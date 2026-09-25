import { getById } from "#shared/services/dungeons/getById";
import { NotFoundError } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getById, () => {
  const id = "id";

  // Every lookup's caller goes on to write onto what it got back — a quantity, a position, a state
  test("hands out a copy, so a write to it never reaches the definition", () => {
    expect.hasAssertions();

    const items = [{ id, value: [0] }];
    getById(items, id, getById.name).value = [];

    expect(items).toStrictEqual([{ id, value: [0] }]);
  });

  test("throws for an id no item carries", () => {
    expect.hasAssertions();

    expect(() => getById([{ id }], "-1", getById.name)).toThrowErrorMatchingInlineSnapshot(
      `[NotFoundError: ${new NotFoundError(getById.name, "-1").message}]`,
    );
  });
});
