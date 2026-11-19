// @vitest-environment nuxt
import { createEntityNotFoundError } from "#src/services/shared/error/createEntityNotFoundError";
import { DatabaseEntityType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createEntityNotFoundError, () => {
  test("404s an entity worded by its type and id, with the hint appended when given", () => {
    expect.hasAssertions();

    const id = v7();
    const error = createEntityNotFoundError(DatabaseEntityType.Post, id, "you might be trying to find a comment");

    expect(error.status).toBe(404);
    expect(error.statusText).toBe(
      `${DatabaseEntityType.Post} is not found for id: ${id}, you might be trying to find a comment`,
    );
  });

  test("words a missing id out of the message when no id is known", () => {
    expect.hasAssertions();

    const error = createEntityNotFoundError(DatabaseEntityType.User);

    expect(error.status).toBe(404);
    expect(error.statusText).toBe(`${DatabaseEntityType.User} is not found`);
  });
});
