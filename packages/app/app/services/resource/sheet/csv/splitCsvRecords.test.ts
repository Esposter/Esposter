import { splitCsvRecords } from "@/services/resource/sheet/csv/splitCsvRecords";
import { describe, expect, test } from "vitest";

describe(splitCsvRecords, () => {
  test("splits on an unquoted newline", () => {
    expect.hasAssertions();

    expect(splitCsvRecords("a\n0\n1")).toStrictEqual(["a", "0", "1"]);
  });

  test("keeps a quoted newline in one record", () => {
    expect.hasAssertions();

    expect(splitCsvRecords('a\n"0\n1"')).toStrictEqual(["a", '"0\n1"']);
  });

  test("keeps a quoted newline that follows a doubled quote", () => {
    expect.hasAssertions();

    expect(splitCsvRecords('a\n"0""1\n2"')).toStrictEqual(["a", '"0""1\n2"']);
  });

  test("treats a carriage return line ending as one separator", () => {
    expect.hasAssertions();

    expect(splitCsvRecords("a\r\n0")).toStrictEqual(["a", "0"]);
  });

  test("drops records that are blank once trimmed", () => {
    expect.hasAssertions();

    expect(splitCsvRecords("a\n\n \n0")).toStrictEqual(["a", "0"]);
  });

  test("unterminated quote consumes the rest of the text", () => {
    expect.hasAssertions();

    expect(splitCsvRecords('a\n"0\n1')).toStrictEqual(["a", '"0\n1']);
  });
});
