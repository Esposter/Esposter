// @vitest-environment happy-dom
import type { Resource } from "@esposter/db-schema";

import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createWebpageSurveyInviteBlocks } from "@/services/webpageEditor/createWebpageSurveyInviteBlocks";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the plain-HTML markup flavour
describe(createWebpageSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";

  test("renders the invite button as a self-styled anchor", () => {
    expect.hasAssertions();

    const blocks = createWebpageSurveyInviteBlocks([{ id, name, type: ResourceType.Survey } as Resource]);

    expect(blocks).toStrictEqual([
      {
        content: `<a href="http://localhost:3000${RoutePath.View(ResourceType.Survey, id)}" style="display: inline-block; padding: 10px 25px; background-color: ${SURVEY_INVITE_BUTTON_COLOR}; color: #ffffff; font-family: Helvetica, sans-serif; font-size: 13px; text-decoration: none; border-radius: 3px;">${name}</a>`,
        id: `survey-invite-${id}`,
        label: name,
      },
    ]);
  });
});
