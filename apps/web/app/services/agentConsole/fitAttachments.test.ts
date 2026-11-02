import { fitAttachments } from "@/services/agentConsole/fitAttachments";
import { AttachmentMediaType, ATTACHMENTS_MAX_BYTE_LENGTH } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe(fitAttachments, () => {
  const name = "name";

  test("refuses an attachment that alone takes the prompt over its ceiling, and keeps the ones after it that fit", () => {
    expect.hasAssertions();

    const overCeiling = { data: " ".repeat(ATTACHMENTS_MAX_BYTE_LENGTH), mediaType: AttachmentMediaType.Text, name };
    const fitting = { data: " ", mediaType: AttachmentMediaType.Text, name };

    expect(fitAttachments([], [overCeiling, fitting])).toStrictEqual({ fitted: [fitting], refused: [overCeiling] });
  });

  test("counts the attachments a prompt already holds against its ceiling", () => {
    expect.hasAssertions();

    const half = { data: " ".repeat(ATTACHMENTS_MAX_BYTE_LENGTH / 2), mediaType: AttachmentMediaType.Text, name };

    expect(fitAttachments([half], [half])).toStrictEqual({ fitted: [], refused: [half] });
  });
});
