// @vitest-environment happy-dom
import { createEmailSurveyInviteBlocks } from "@/services/emailEditor/createEmailSurveyInviteBlocks";
import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the MJML markup flavour
describe(createEmailSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";

  test("renders the invite button as MJML", () => {
    expect.hasAssertions();

    const blocks = createEmailSurveyInviteBlocks([createResourceListItem({ id, name, type: ResourceType.Survey })]);

    expect(blocks).toStrictEqual([
      {
        content: `<mj-button background-color="${SURVEY_INVITE_BUTTON_COLOR}" href="${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}">${name}</mj-button>`,
        id: `survey-invite-${id}`,
        label: name,
      },
    ]);
  });
});
