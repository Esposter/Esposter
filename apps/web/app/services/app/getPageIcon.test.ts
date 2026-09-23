import { getPageIcon } from "@/services/app/getPageIcon";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";
import { DocsSectionIconMap } from "@/services/docs/DocsSectionIconMap";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getPageIcon, () => {
  const section = "achievement";
  const sectionPath = `${RoutePath.Docs}/${section}`;

  test("takes a listed page's own icon", () => {
    expect.hasAssertions();

    expect(getPageIcon(UserSettingsPageLinkItem.href)).toBe(UserSettingsPageLinkItem.icon);
  });

  test("gives a docs page its section's icon, at the section and inside it", () => {
    expect.hasAssertions();

    expect(getPageIcon(sectionPath)).toBe(DocsSectionIconMap[section]);
    expect(getPageIcon(`${sectionPath}/${section}`)).toBe(DocsSectionIconMap[section]);
  });

  test("leaves any other page to its title's first letter", () => {
    expect.hasAssertions();

    expect(getPageIcon(RoutePath.Messages(crypto.randomUUID()))).toBeUndefined();
  });
});
