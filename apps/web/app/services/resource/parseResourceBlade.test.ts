import { ResourceBladeSlug } from "#src/models/resource/ResourceBladeSlug";
import { ResourceBladeType } from "#src/models/resource/ResourceBladeType";
import { parseResourceBlade } from "#src/services/resource/parseResourceBlade";
import { describe, expect, test } from "vitest";

describe(parseResourceBlade, () => {
  test("keeps a segment that names a blade", () => {
    expect.hasAssertions();

    expect(parseResourceBlade(ResourceBladeSlug.Items)).toBe(ResourceBladeSlug.Items);
    expect(parseResourceBlade(ResourceBladeType.Activity)).toBe(ResourceBladeType.Activity);
  });

  test("falls back to Overview for a segment no blade is named by", () => {
    expect.hasAssertions();

    expect(parseResourceBlade("calender")).toBe(ResourceBladeType.Overview);
  });
});
