import { getRequestJsonSchema, readUnboundedPaths } from "#server/services/request/readUnboundedPaths.test";
import { webhookPayloadSchema } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("webhookPayloadSchema", () => {
  // Anyone holding a webhook's token posts to it, and the route hands the body on whole, so the payload is held to the
  // Same ceiling a procedure's input is: no string a caller can stretch past what a message stores
  test("bounds every string and array in the payload", () => {
    expect.hasAssertions();

    expect(readUnboundedPaths(getRequestJsonSchema(webhookPayloadSchema), "webhookPayload")).toStrictEqual([]);
  });
});
