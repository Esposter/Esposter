import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RECENT_PAGE_EXCLUDED_PATHS } from "@/services/app/constants";
import { getPageLabel } from "@/services/app/getPageLabel";
import { getPageLinkItem } from "@/services/app/getPageLinkItem";
import { RoutePath } from "@esposter/shared";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getPageLabel, () => {
  const path = RoutePath.Index;

  // The messages page redirects to the last room before its head renders, so no title is ever recorded for it
  test("names a product's page by the product, whatever title was recorded for it", () => {
    expect.hasAssertions();

    expect(getPageLabel(RoutePath.MessagesIndex, "")).toBe(MESSAGE_DISPLAY_NAME);
  });

  test("falls back to the recorded title, then the path", () => {
    expect.hasAssertions();

    expect(getPageLabel(path, "title")).toBe("title");
    expect(getPageLabel(path, "")).toBe(path);
  });

  // A page that sets no title of its own is recorded as the site's name, or as nothing, and the dock can only show it
  // By its path or by the site's first letter
  describe("every page names itself", () => {
    const pagesDirectory = join(import.meta.dirname, "../../pages");
    const pageFiles = readdirSync(pagesDirectory, { recursive: true })
      .map((file) => String(file).replaceAll("\\", "/"))
      .filter((file) => file.endsWith(".vue"));
    // The messages layout titles every room page with its room's name, and a published view's renderer titles its
    // Page with the resource it reads (useReadPublishedResourceContent)
    const elsewhereTitledPageFiles = new Set([
      "messages/[id]/[rowKey].vue",
      "messages/[id]/index.vue",
      "messages/[id]/thread/[rowKey].vue",
      "view/[type]/[id].vue",
    ]);
    const titleRegex = /<Title>|useSeoMeta\(\{[^}]*title|useHead\(\{[^}]*title/u;

    test.each(pageFiles)("%s", (pageFile) => {
      expect.hasAssertions();

      const routePath = `/${pageFile.replace(/\.vue$/u, "").replace(/(?:^|\/)index$/u, "")}`;
      const isNamedElsewhere =
        RECENT_PAGE_EXCLUDED_PATHS.includes(routePath) ||
        getPageLinkItem(routePath) !== undefined ||
        elsewhereTitledPageFiles.has(pageFile);

      expect(isNamedElsewhere || titleRegex.test(readFileSync(join(pagesDirectory, pageFile), "utf8"))).toBe(true);
    });
  });
});
