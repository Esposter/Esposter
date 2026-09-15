// @vitest-environment happy-dom
import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { createWebpageSurveyInviteBlocks } from "@/services/webpageEditor/createWebpageSurveyInviteBlocks";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The list-to-blocks matrix lives in createSurveyInviteBlocks.test.ts; here only the plain-HTML markup flavour
describe(createWebpageSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";

  test("renders the invite button as a coloured anchor", () => {
    expect.hasAssertions();

    const blocks = createWebpageSurveyInviteBlocks([createResourceListItem({ id, name, type: ResourceType.Survey })]);

    expect(blocks).toStrictEqual([
      {
        content: `<a href="${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}" style="background-color: ${SURVEY_INVITE_BUTTON_COLOR}">${name}</a>`,
        id: `survey-invite-${id}`,
        label: name,
      },
    ]);
  });
});
