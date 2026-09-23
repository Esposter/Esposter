import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { getPageLabel } from "@/services/app/getPageLabel";
import { RoutePath } from "@esposter/shared";
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
});
