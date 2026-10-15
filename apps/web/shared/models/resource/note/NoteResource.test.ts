import { noteResourceSchema } from "#shared/models/resource/note/NoteResource";
import { describe, expect, test } from "vitest";

describe(noteResourceSchema, () => {
  test("accepts a document supported by the Note writing kit", () => {
    expect.hasAssertions();

    expect(
      noteResourceSchema.safeParse({
        doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "note" }] }] },
      }).success,
    ).toBe(true);
  });

  test("accepts table nodes supported by the Note writing kit", () => {
    expect.hasAssertions();

    expect(
      noteResourceSchema.safeParse({
        doc: {
          type: "doc",
          content: [
            {
              type: "table",
              content: [
                {
                  type: "tableRow",
                  content: [
                    { type: "tableHeader", content: [{ type: "paragraph" }] },
                    { type: "tableHeader", content: [{ type: "paragraph" }] },
                  ],
                },
                {
                  type: "tableRow",
                  content: [
                    { type: "tableCell", content: [{ type: "paragraph" }] },
                    { type: "tableCell", content: [{ type: "paragraph" }] },
                  ],
                },
              ],
            },
          ],
        },
      }).success,
    ).toBe(true);
  });

  test("rejects a document node the Note writing kit does not support", () => {
    expect.hasAssertions();

    expect(
      noteResourceSchema.safeParse({ doc: { type: "doc", content: [{ type: "uninstalledExtension" }] } }).success,
    ).toBe(false);
  });
});
