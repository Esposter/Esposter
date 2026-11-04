// @vitest-environment happy-dom
import type { PdfFreeText } from "#src/models/PdfFreeText";

import { readXfdf } from "#src/xfdf/readXfdf";
import { writeXfdf } from "#src/xfdf/writeXfdf";
import { err, ok } from "neverthrow";
import { describe, expect, test } from "vitest";

// The ids the free texts of a file are read into, in the file's order
const readIds = (xfdf: string) => readXfdf(xfdf, new Set()).map((freeTexts) => freeTexts.map(({ id }) => id));

describe("xFDF", () => {
  const FIRST_NOTE: PdfFreeText = { contents: "First note", id: "first", pageNumber: 1, rect: [72, 700, 300, 720] };
  const SECOND_NOTE: PdfFreeText = { contents: "Second note", id: "second", pageNumber: 3, rect: [10, 20, 30, 40] };

  test("#69 An XFDF round trip", () => {
    expect.hasAssertions();

    expect(readXfdf(writeXfdf([FIRST_NOTE, SECOND_NOTE]), new Set())).toStrictEqual(ok([FIRST_NOTE, SECOND_NOTE]));
  });

  test("xFDF with no free texts reads as none", () => {
    expect.hasAssertions();

    expect(readXfdf(writeXfdf([]), new Set())).toStrictEqual(ok([]));
  });

  test("xFDF escapes the text it writes and reads it back as written", () => {
    expect.hasAssertions();

    const note: PdfFreeText = { ...FIRST_NOTE, contents: `A < B & "C" > D` };

    expect(readXfdf(writeXfdf([note]), new Set())).toStrictEqual(ok([note]));
  });

  test("xFDF drops the control characters XML cannot hold, so the file it writes still reads", () => {
    expect.hasAssertions();

    const note: PdfFreeText = { ...FIRST_NOTE, contents: "A\u000BB" };

    expect(readXfdf(writeXfdf([note]), new Set())).toStrictEqual(ok([{ ...FIRST_NOTE, contents: "AB" }]));
  });

  test("a free text with no valid rect is named in the error", () => {
    expect.hasAssertions();

    const xfdf = `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="a" page="0" rect="1,2,3"><contents>x</contents></freetext></annots></xfdf>`;

    expect(readXfdf(xfdf, new Set())).toStrictEqual(err("Free text 1 has no valid rect"));
  });

  test.each(["", " "])("a free text whose contents are %j is named in the error", (contents) => {
    expect.hasAssertions();

    const xfdf = `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="a" page="0" rect="1,2,3,4"><contents>${contents}</contents></freetext></annots></xfdf>`;

    expect(readXfdf(xfdf, new Set())).toStrictEqual(err("Free text 1 has no contents"));
  });

  test("free texts with no name each read with an id of their own", () => {
    expect.hasAssertions();

    const xfdf = `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="" page="0" rect="1,2,3,4"><contents>a</contents></freetext><freetext name="" page="0" rect="1,2,3,4"><contents>a</contents></freetext></annots></xfdf>`;

    expect(readIds(xfdf).map((ids) => new Set(ids).size)).toStrictEqual(ok(2));
  });

  test("free texts that share a name read with the name on the first and an id of their own on the next", () => {
    expect.hasAssertions();

    const xfdf = `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="a" page="0" rect="1,2,3,4"><contents>a</contents></freetext><freetext name="a" page="0" rect="1,2,3,4"><contents>a</contents></freetext></annots></xfdf>`;

    expect(readIds(xfdf).map(([first]) => first)).toStrictEqual(ok("a"));
    expect(readIds(xfdf).map((ids) => new Set(ids).size)).toStrictEqual(ok(2));
  });
});
