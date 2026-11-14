import { getAssistantPrompt } from "@/services/resource/getAssistantPrompt";
import { ResourceType } from "@esposter/db-schema";
import { SITE_NAME } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getAssistantPrompt, () => {
  const id = v7();
  const line = "rename the heading";

  test("names the resource by its id and type, then the line", () => {
    expect.hasAssertions();

    expect(getAssistantPrompt({ id, type: ResourceType.Note }, line)).toBe(
      `In ${SITE_NAME}, the Note with id ${id}: ${line}`,
    );
  });
});
