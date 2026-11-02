import { readAttachment } from "@/services/agentConsole/readAttachment";
import { AttachmentMediaType, ATTACHMENTS_MAX_BYTE_LENGTH } from "agent-console-server/contracts";
import { describe, expect, test, vi } from "vitest";

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

  test("reads UTF-16 text by its byte order mark", async () => {
    expect.hasAssertions();

    await expect(readAttachment(new File([new Uint8Array([0xff, 0xfe, 97, 0])], name))).resolves.toStrictEqual({
      data: "a",
      mediaType: AttachmentMediaType.Text,
      name,
    });
    await expect(readAttachment(new File([new Uint8Array([0xfe, 0xff, 0, 97])], name))).resolves.toStrictEqual({
      data: "a",
      mediaType: AttachmentMediaType.Text,
      name,
    });
  });

  test("leaves out a file that is neither", async () => {
    expect.hasAssertions();

    await expect(readAttachment(new File([new Uint8Array([255])], name))).resolves.toBeUndefined();
  });

  test("leaves out a file its size alone takes over the ceiling, without reading it", async () => {
    expect.hasAssertions();

    // A file that large, with its bytes left out, as its size reports it
    const file = new File(["a"], name);
    Object.defineProperty(file, "size", { value: ATTACHMENTS_MAX_BYTE_LENGTH * 2 + 1 });
    const arrayBuffer = vi.spyOn(file, "arrayBuffer");

    await expect(readAttachment(file)).resolves.toBeUndefined();
    expect(arrayBuffer).not.toHaveBeenCalled();
  });
});
