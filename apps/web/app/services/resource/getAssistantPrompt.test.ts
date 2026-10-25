// @vitest-environment nuxt
import { getAssistantPrompt } from "@/services/resource/getAssistantPrompt";
import { ResourceType } from "@esposter/db-schema";
import { SITE_NAME } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getAssistantPrompt, () => {
  const id = crypto.randomUUID();
  const line = "rename the heading";

  test("names the resource by its id and type, then the line", () => {
    expect.hasAssertions();

    expect(getAssistantPrompt({ id, type: ResourceType.Note }, line)).toBe(
      `In ${SITE_NAME}, the Note with id ${id}: ${line}`,
    );
  });
});
