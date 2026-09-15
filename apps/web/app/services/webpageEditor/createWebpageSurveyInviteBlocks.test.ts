// @vitest-environment happy-dom
import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { createWebpageSurveyInviteBlocks } from "@/services/webpageEditor/createWebpageSurveyInviteBlocks";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the plain-HTML markup flavour
describe(createWebpageSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";

  // The published page loads no stylesheet of ours, so the anchor has to carry its own colour
  test("renders the invite as a self-coloured anchor to the survey", () => {
    expect.hasAssertions();

    const blocks = createWebpageSurveyInviteBlocks([createResourceListItem({ id, name, type: ResourceType.Survey })]);
    const anchor = new DOMParser().parseFromString(takeOne(blocks).content, "text/html").querySelector("a");
    assert.exists(anchor);

    expect(anchor.getAttribute("href")).toBe(`${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}`);
    expect(anchor.textContent).toBe(name);
    expect(anchor.style.backgroundColor).toBe(SURVEY_INVITE_BUTTON_COLOR);
  });
});
