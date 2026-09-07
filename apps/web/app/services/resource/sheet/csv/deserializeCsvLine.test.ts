import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { deserializeCsvLine } from "@/services/resource/sheet/csv/deserializeCsvLine";
import { describe, expect, test } from "vitest";

describe(deserializeCsvLine, () => {
  const delimiter = CsvDelimiter.Comma;

  test("quoted field keeps the delimiter", () => {
    expect.hasAssertions();

    expect(deserializeCsvLine('"0,1",2', delimiter)).toStrictEqual(["0,1", "2"]);
  });

  test("quoted field unescapes a doubled quote", () => {
    expect.hasAssertions();

    expect(deserializeCsvLine('"0""1"', delimiter)).toStrictEqual(['0"1']);
  });

  test("quoted field keeps a newline", () => {
    expect.hasAssertions();

    expect(deserializeCsvLine('"0\n1"', delimiter)).toStrictEqual(["0\n1"]);
  });

  test("quoted field is trimmed", () => {
    expect.hasAssertions();

    expect(deserializeCsvLine('" ",0', delimiter)).toStrictEqual(["", "0"]);
  });

  test("unterminated quote consumes the rest of the line", () => {
    expect.hasAssertions();

    expect(deserializeCsvLine('"0,1', delimiter)).toStrictEqual(["0,1"]);
  });
});
