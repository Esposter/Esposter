import { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { describe, expect, test } from "vitest";

describe("resourceBladeSlug", () => {
  // Both enums feed the one `[[blade]]` segment, and a shared value resolves to whichever the definition list
  // Reaches first — a wrong blade rather than an error. The enums are nominal, so typecheck cannot see it
  test("collides with no built-in blade slug", () => {
    expect.hasAssertions();

    const builtInSlugs: string[] = Object.values(ResourceBladeType);

    expect(Object.values(ResourceBladeSlug).filter((slug) => builtInSlugs.includes(slug))).toStrictEqual([]);
  });
});
