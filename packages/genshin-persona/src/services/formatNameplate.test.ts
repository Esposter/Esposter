import { ANSI_RESET, ElementColorMap } from "#src/services/constants";
import { formatNameplate } from "#src/services/formatNameplate";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { describe, expect, test } from "vitest";

describe(formatNameplate, () => {
  // The display name is what is drawn and the English name is only the identity, so they differ here
  const displayName = "displayName";
  const name = "name";

  test.each(Object.entries(ElementColorMap))("wraps the nameplate in %s's colour", (element, color) => {
    expect.hasAssertions();

    expect(formatNameplate({ displayName, element, name })).toBe(
      `${getAnsiForegroundColor(color)}✦ ${displayName}${ANSI_RESET}`,
    );
  });

  test.each(["", "None"])("leaves the nameplate plain for the element %j", (element) => {
    expect.hasAssertions();

    expect(formatNameplate({ displayName, element, name })).toBe(`✦ ${displayName}`);
  });
});
