import { escapeCsvCell } from "@/services/resource/sheet/csv/escapeCsvCell";
import { describe, expect, test } from "vitest";

describe(escapeCsvCell, () => {
  test("writes a plain cell unchanged", () => {
    expect.hasAssertions();

    expect(escapeCsvCell("plain", ",")).toBe("plain");
  });

  test("quotes a cell holding the delimiter, a quote or a line break, doubling its quotes", () => {
    expect.hasAssertions();

    expect(escapeCsvCell("a,b", ",")).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"', ",")).toBe('"say ""hi"""');
    expect(escapeCsvCell("a\nb", ",")).toBe('"a\nb"');
  });

  test("a formula trigger gets a tab ahead of it, inside the quotes", () => {
    expect.hasAssertions();

    expect(escapeCsvCell("=1+1", ",")).toBe('"\t=1+1"');
    expect(escapeCsvCell('=say "hi"', ",")).toBe('"\t=say ""hi"""');
  });

  test("a lone sign is a formula trigger, since it is no number", () => {
    expect.hasAssertions();

    expect(escapeCsvCell("-", ",")).toBe('"\t-"');
  });

  test("a number that opens with a sign is written as it is", () => {
    expect.hasAssertions();

    expect(escapeCsvCell("-5", ",")).toBe("-5");
    expect(escapeCsvCell("+3.5", ",")).toBe("+3.5");
  });

  test("an empty cell is written as it is", () => {
    expect.hasAssertions();

    expect(escapeCsvCell("", ",")).toBe("");
  });
});
