// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { createEmailSurveyInviteBlocks } from "@/services/emailEditor/createEmailSurveyInviteBlocks";
import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the MJML markup flavour
describe(createEmailSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";

  test("renders the invite button as MJML", () => {
    expect.hasAssertions();

    const blocks = createEmailSurveyInviteBlocks([{ id, name, type: ResourceType.Survey } as Resource]);

    expect(blocks).toStrictEqual([
      {
        content: `<mj-button background-color="${SURVEY_INVITE_BUTTON_COLOR}" href="http://localhost:3000${RoutePath.View(ResourceType.Survey, id)}">${name}</mj-button>`,
        id: `survey-invite-${id}`,
        label: name,
      },
    ]);
  });
});
