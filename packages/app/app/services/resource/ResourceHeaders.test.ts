import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { describe, expect, test } from "vitest";

describe("resourceHeaders", () => {
  // The column chooser lists every toggleable header by title, so a blank one renders a checkbox with no way
  // To tell what it toggles
  test("titles every column", () => {
    expect.hasAssertions();

    expect(ResourceHeaders.filter(({ title }) => !title)).toStrictEqual([]);
  });
});
