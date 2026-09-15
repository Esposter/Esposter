// @vitest-environment happy-dom
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { createSurveyInviteBlocks } from "@/services/grapesjs/createSurveyInviteBlocks";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const renderButton = ({ label, url }: { label: string; url: string }) => `${label}|${url}`;

describe(createSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";
  const createSurvey = (survey?: Partial<ResourceListItem>) =>
    createResourceListItem({ id, name, type: ResourceType.Survey, ...survey });

  test("builds one block per survey linking its public url", () => {
    expect.hasAssertions();

    const blocks = createSurveyInviteBlocks([createSurvey()], renderButton);

    expect(blocks).toStrictEqual([
      {
        content: `${name}|${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}`,
        id: `survey-invite-${id}`,
        label: name,
      },
    ]);
  });

  test("escapes the survey name in both the label and the rendered button", () => {
    expect.hasAssertions();

    const blocks = createSurveyInviteBlocks([createSurvey({ name: "P&L <b>" })], renderButton);

    expect(blocks).toStrictEqual([
      {
        content: `P&amp;L &lt;b&gt;|${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}`,
        id: `survey-invite-${id}`,
        label: "P&amp;L &lt;b&gt;",
      },
    ]);
  });

  test("builds no blocks without surveys", () => {
    expect.hasAssertions();

    const blocks = createSurveyInviteBlocks([], renderButton);

    expect(blocks).toStrictEqual([]);
  });
});
