import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

describe(createParty, () => {
  test("refuses a first team that is empty, past four or holds a character twice", () => {
    expect.hasAssertions();

    expect(() => createParty([])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: createParty, team 0 cannot hold ]`,
    );
    expect(() => createParty([1, 2, 3, 4, 5])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: createParty, team 0 cannot hold 1, 2, 3, 4, 5]`,
    );
    expect(() => createParty([1, 1])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: createParty, team 0 cannot hold 1, 1]`,
    );
  });
});
