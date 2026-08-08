// @vitest-environment nuxt
// The editor component map reaches GrapesJS, which touches `window` at import time
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
import { isValidResourceBlade } from "@/services/resource/isValidResourceBlade";
import { ResourceType, ResourceTypes } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

const getSlugs = (type: ResourceType) => getResourceBladeDefinitions(type).map(({ slug }) => slug);

describe(getResourceBladeDefinitions, () => {
  test("opens every type with Overview", () => {
    expect.hasAssertions();

    for (const type of ResourceTypes)
      expect(getResourceBladeDefinitions(type)[0]?.slug).toBe(ResourceBladeType.Overview);
  });

  // Blade-only types render no inline editor, so offering the blade would route to an empty outlet
  test("offers the Editor blade only to types with an inline editor", () => {
    expect.hasAssertions();

    expect(getSlugs(ResourceType.Note)).toContain(ResourceBladeType.Editor);
    expect(getSlugs(ResourceType.Sheet)).not.toContain(ResourceBladeType.Editor);
  });

  // Only publishable types have snapshots, so only they get the history blade
  test("offers Publish history only to publishable types", () => {
    expect.hasAssertions();

    expect(getSlugs(ResourceType.Survey)).toContain(ResourceBladeType.PublishHistory);
    expect(getSlugs(ResourceType.Blueprint)).not.toContain(ResourceBladeType.PublishHistory);
  });

  test("titles and icons every blade it offers", () => {
    expect.hasAssertions();

    for (const type of ResourceTypes)
      expect(getResourceBladeDefinitions(type).filter(({ icon, title }) => !icon || !title)).toStrictEqual([]);
  });

  // The nav and the route guard read one source, so a blade the nav links can never 404
  test("routes exactly the blades it offers", () => {
    expect.hasAssertions();

    for (const type of ResourceTypes)
      for (const { slug } of getResourceBladeDefinitions(type)) expect(isValidResourceBlade(type, slug)).toBe(true);
  });

  test("rejects a blade no type offers", () => {
    expect.hasAssertions();
    expect(isValidResourceBlade(ResourceType.Note, "not-a-blade")).toBe(false);
  });
});
