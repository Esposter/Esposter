import { getRequestJsonSchema } from "#server/services/request/getRequestJsonSchema.test";
import { readUnboundedPaths } from "#server/services/request/readUnboundedPaths.test";
import { webhookPayloadSchema } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("webhookPayloadSchema", () => {
  // Anyone holding a webhook's token posts to it, and the route hands the body on whole, so the payload is held to the
  // Same ceiling a procedure's input is: no string a caller can stretch past what a message stores
  test("bounds every string and array in the payload", () => {
    expect.hasAssertions();

    expect(readUnboundedPaths(getRequestJsonSchema(webhookPayloadSchema), "webhookPayload")).toStrictEqual([]);
  });

  test("takes an avatar_url only as https, so a message never draws its picture over plain http", () => {
    expect.hasAssertions();

    expect(webhookPayloadSchema.safeParse({ avatar_url: "http://example.com/avatar", content: "a" }).success).toBe(
      false,
    );
    expect(webhookPayloadSchema.safeParse({ avatar_url: "https://example.com/avatar", content: "a" }).success).toBe(
      true,
    );
  });
});
