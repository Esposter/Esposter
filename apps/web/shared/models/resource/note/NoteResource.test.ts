import { noteResourceSchema } from "#shared/models/resource/note/NoteResource";
import { describe, expect, test } from "vitest";

describe("noteResourceSchema", () => {
  test("accepts a document supported by the Note writing kit", () => {
    expect.hasAssertions();

    expect(
      noteResourceSchema.safeParse({
        doc: { content: [{ content: [{ text: "note", type: "text" }], type: "paragraph" }], type: "doc" },
      }).success,
    ).toBe(true);
  });

  test("accepts table nodes supported by the Note writing kit", () => {
    expect.hasAssertions();

    expect(
      noteResourceSchema.safeParse({
        doc: {
          content: [
            {
              content: [
                {
                  content: [
                    { content: [{ type: "paragraph" }], type: "tableHeader" },
                    { content: [{ type: "paragraph" }], type: "tableHeader" },
                  ],
                  type: "tableRow",
                },
                {
                  content: [
                    { content: [{ type: "paragraph" }], type: "tableCell" },
                    { content: [{ type: "paragraph" }], type: "tableCell" },
                  ],
                  type: "tableRow",
                },
              ],
              type: "table",
            },
          ],
          type: "doc",
        },
      }).success,
    ).toBe(true);
  });

  test("rejects a document node the Note writing kit does not support", () => {
    expect.hasAssertions();

    expect(
      noteResourceSchema.safeParse({ doc: { content: [{ type: "uninstalledExtension" }], type: "doc" } }).success,
    ).toBe(false);
  });
});
