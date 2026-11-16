import { PAGE_TITLE_SEPARATOR, SITE_NAME } from "#shared/services/app/constants";
import { getPageTitle } from "#src/services/app/getPageTitle";
import { describe, expect, test } from "vitest";

describe(getPageTitle, () => {
  test("takes the page's own name, the last part of a title the site and product come before", () => {
    expect.hasAssertions();

    const pageName = " ";

    expect(getPageTitle(`${SITE_NAME}${PAGE_TITLE_SEPARATOR}${pageName}`)).toBe(pageName);
  });
});
