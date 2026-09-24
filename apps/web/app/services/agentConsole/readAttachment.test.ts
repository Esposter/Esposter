import { readAttachment } from "@/services/agentConsole/readAttachment";
import { AttachmentMediaType } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe(readAttachment, () => {
  const name = "name";

  test("reads an image or a PDF by its type, and any other file whose bytes are text as text", async () => {
    expect.hasAssertions();

    await expect(readAttachment(new File(["a"], name, { type: AttachmentMediaType.Pdf }))).resolves.toStrictEqual({
      data: "YQ==",
      mediaType: AttachmentMediaType.Pdf,
      name,
    });
    await expect(readAttachment(new File(["a"], name))).resolves.toStrictEqual({
      data: "a",
      mediaType: AttachmentMediaType.Text,
      name,
    });
  });

  test("leaves out a file that is neither", async () => {
    expect.hasAssertions();

    await expect(readAttachment(new File([new Uint8Array([255])], name))).resolves.toBeUndefined();
  });
});
