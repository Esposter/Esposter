import { PageMarkType } from "#shared/models/app/PageMarkType";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getPageIcon } from "@/services/app/getPageIcon";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";
import { DocsSectionIconMap } from "@/services/docs/DocsSectionIconMap";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getPageIcon, () => {
  const section = "achievement";
  const sectionPath = `${RoutePath.Docs}/${section}`;
  const mark = { resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };

  test("takes a listed page's own icon over its mark", () => {
    expect.hasAssertions();

    expect(getPageIcon({ mark, path: UserSettingsPageLinkItem.href })).toBe(UserSettingsPageLinkItem.icon);
  });

  test("gives a docs page its section's icon, at the section and inside it", () => {
    expect.hasAssertions();

    expect(getPageIcon({ path: sectionPath })).toBe(DocsSectionIconMap[section]);
    expect(getPageIcon({ path: `${sectionPath}/${section}` })).toBe(DocsSectionIconMap[section]);
  });

  test("gives a page its path does not name its mark's icon", () => {
    expect.hasAssertions();

    expect(getPageIcon({ mark, path: RoutePath.Resource(crypto.randomUUID()) })).toBe(
      ResourceDefinitionMap[mark.resourceType].icon,
    );
  });

  test("leaves any other page to its title's first letter", () => {
    expect.hasAssertions();

    expect(getPageIcon({ path: RoutePath.Messages(crypto.randomUUID()) })).toBeUndefined();
  });
});
