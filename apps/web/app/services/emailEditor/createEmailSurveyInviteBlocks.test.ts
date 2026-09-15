// @vitest-environment happy-dom
import { createEmailSurveyInviteBlocks } from "@/services/emailEditor/createEmailSurveyInviteBlocks";
import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the MJML markup flavour
describe(createEmailSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";

  test("renders the invite as a coloured mj-button to the survey", () => {
    expect.hasAssertions();

    const blocks = createEmailSurveyInviteBlocks([createResourceListItem({ id, name, type: ResourceType.Survey })]);
    const button = new DOMParser().parseFromString(takeOne(blocks).content, "text/html").querySelector("mj-button");
    assert.exists(button);

    expect(button.getAttribute("href")).toBe(`${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}`);
    expect(button.textContent).toBe(name);
    expect(button.getAttribute("background-color")).toBe(SURVEY_INVITE_BUTTON_COLOR);
  });
});
