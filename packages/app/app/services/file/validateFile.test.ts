import { KIBIBYTE, MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { validateFile } from "@/services/file/validateFile";
import { describe, expect, test } from "vitest";

describe(validateFile, () => {
  test("rejects a non-positive size", () => {
    expect.hasAssertions();

    expect(validateFile(0)).toStrictEqual({ isValid: false, message: "You can only upload non-empty files!" });
  });

  test("rejects a size above the max", () => {
    expect.hasAssertions();

    expect(validateFile(MAX_FILE_REQUEST_SIZE + 1)).toStrictEqual({
      isValid: false,
      message: `You can only upload files up to ${getFileSize(MAX_FILE_REQUEST_SIZE)}!`,
    });
  });

  test("accepts a size within the max", () => {
    expect.hasAssertions();

    expect(validateFile(MEGABYTE)).toStrictEqual({ isValid: true });
  });

  test("narrows to a caller-supplied max", () => {
    expect.hasAssertions();

    expect(validateFile(2 * MEGABYTE, MEGABYTE)).toStrictEqual({
      isValid: false,
      message: "You can only upload files up to 1 MB!",
    });
  });

  test("describes a sub-megabyte max in its own magnitude", () => {
    expect.hasAssertions();

    expect(validateFile(MEGABYTE, 512 * KIBIBYTE)).toStrictEqual({
      isValid: false,
      message: "You can only upload files up to 512 KB!",
    });
  });
});
