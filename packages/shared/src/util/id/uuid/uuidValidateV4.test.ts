import { uuidValidateV4 } from "@/util/id/uuid/uuidValidateV4";
import { randomUUID } from "node:crypto";
import { describe, expect, test } from "vitest";

describe(uuidValidateV4, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(uuidValidateV4("")).toBe(false);
  });

  test("validates v4 uuids", () => {
    expect.hasAssertions();

    expect(uuidValidateV4(randomUUID())).toBe(true);
  });
});
