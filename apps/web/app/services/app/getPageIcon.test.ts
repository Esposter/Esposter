import { PageMarkType } from "#shared/models/app/PageMarkType";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getPageIcon } from "#src/services/app/getPageIcon";
import { UserSettingsPageLinkItem } from "#src/services/app/UserSettingsPageLinkItem";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getPageIcon, () => {
  const mark = { id: v7(), resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };

  test("takes a listed page's own icon over its mark", () => {
    expect.hasAssertions();

    expect(getPageIcon({ mark, path: UserSettingsPageLinkItem.href })).toStrictEqual({
      icon: UserSettingsPageLinkItem.icon,
    });
  });

  test("gives a page its path does not name its mark's icon", () => {
    expect.hasAssertions();

    expect(getPageIcon({ mark, path: RoutePath.Resource(v7()) })).toStrictEqual({
      icon: ResourceDefinitionMap[mark.resourceType].icon,
    });
  });

  test("gives a room's page its room meaning", () => {
    expect.hasAssertions();

    expect(getPageIcon({ mark: { id: v7(), type: PageMarkType.Room }, path: RoutePath.Messages(v7()) })).toStrictEqual({
      meaning: UiIconMeaning.Comment,
    });
  });

  test("leaves any other page without an icon", () => {
    expect.hasAssertions();

    expect(getPageIcon({ path: RoutePath.Messages(v7()) })).toBeUndefined();
  });
});
