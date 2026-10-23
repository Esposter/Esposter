// @vitest-environment happy-dom
import type { PdfFreeText } from "#src/models/PdfFreeText";

import { readXfdf } from "#src/xfdf/readXfdf";
import { writeXfdf } from "#src/xfdf/writeXfdf";
import { err, ok } from "neverthrow";
import { describe, expect, test } from "vitest";

describe("xFDF", () => {
  const FIRST_NOTE: PdfFreeText = { contents: "First note", id: "first", pageNumber: 1, rect: [72, 700, 300, 720] };
  const SECOND_NOTE: PdfFreeText = { contents: "Second note", id: "second", pageNumber: 3, rect: [10, 20, 30, 40] };

  test("#69 An XFDF round trip", () => {
    expect.hasAssertions();

    expect(readXfdf(writeXfdf([FIRST_NOTE, SECOND_NOTE]))).toStrictEqual(ok([FIRST_NOTE, SECOND_NOTE]));
  });

  test("xFDF with no free texts reads as none", () => {
    expect.hasAssertions();

    expect(readXfdf(writeXfdf([]))).toStrictEqual(ok([]));
  });

  test("xFDF escapes the text it writes and reads it back as written", () => {
    expect.hasAssertions();

    const note: PdfFreeText = { ...FIRST_NOTE, contents: `A < B & "C" > D` };

    expect(readXfdf(writeXfdf([note]))).toStrictEqual(ok([note]));
  });

  test("xFDF drops the control characters XML cannot hold, so the file it writes still reads", () => {
    expect.hasAssertions();

    const note: PdfFreeText = { ...FIRST_NOTE, contents: "A\u000BB" };

    expect(readXfdf(writeXfdf([note]))).toStrictEqual(ok([{ ...FIRST_NOTE, contents: "AB" }]));
  });

  test("a free text with no valid rect is named in the error", () => {
    expect.hasAssertions();

    const xfdf = `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="a" page="0" rect="1,2,3"><contents>x</contents></freetext></annots></xfdf>`;

    expect(readXfdf(xfdf)).toStrictEqual(err("Free text 1 has no valid rect"));
  });
});
