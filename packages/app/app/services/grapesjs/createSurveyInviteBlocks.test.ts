// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { createSurveyInviteBlocks } from "@/services/grapesjs/createSurveyInviteBlocks";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const renderButton = ({ label, url }: { label: string; url: string }) => `${label}|${url}`;

describe(createSurveyInviteBlocks, () => {
  const id = crypto.randomUUID();
  const name = "name";
  const origin = "http://localhost:3000";
  const createSurvey = (survey?: Partial<Resource>): Resource =>
    ({ id, name, type: ResourceType.Survey, ...survey }) as Resource;

  test("builds one block per survey linking its public url", () => {
    expect.hasAssertions();

    const blocks = createSurveyInviteBlocks([createSurvey()], renderButton);

    expect(blocks).toStrictEqual([
      {
        content: `${name}|${origin}${RoutePath.View(ResourceType.Survey, id)}`,
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
        content: `P&amp;L &lt;b&gt;|${origin}${RoutePath.View(ResourceType.Survey, id)}`,
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
