// @vitest-environment happy-dom
// The editor component map reaches GrapesJS, which touches `window` at import time
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { checkIsValidResourceBlade } from "@/services/resource/checkIsValidResourceBlade";
import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
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

  // Editor is the one built-in blade that declares no icon of its own: it renders the type's own editor, so the
  // Rail entry has to be the type's own icon rather than a generic pencil shared by every editable type
  test("gives the Editor blade the type's own icon", () => {
    expect.hasAssertions();

    expect(
      getResourceBladeDefinitions(ResourceType.Note).find(({ slug }) => slug === ResourceBladeType.Editor)?.icon,
    ).toBe(ResourceDefinitionMap[ResourceType.Note].icon);
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
      for (const { slug } of getResourceBladeDefinitions(type))
        expect(checkIsValidResourceBlade(type, slug)).toBe(true);
  });

  test("rejects a blade no type offers", () => {
    expect.hasAssertions();
    expect(checkIsValidResourceBlade(ResourceType.Note, "not-a-blade")).toBe(false);
  });

  // A guard that only checks the slug against the whole blade vocabulary would route a Sheet to an Editor
  // Blade it renders nothing in — the blade has to be one *this* type offers
  test("rejects a real blade the type does not offer", () => {
    expect.hasAssertions();
    expect(checkIsValidResourceBlade(ResourceType.Sheet, ResourceBladeType.Editor)).toBe(false);
  });
});
