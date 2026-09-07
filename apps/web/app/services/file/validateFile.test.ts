import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { EMPTY_FILE_MESSAGE } from "@/services/file/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { validateFile } from "@/services/file/validateFile";
import { describe, expect, test } from "vitest";

describe(validateFile, () => {
  test("rejects a non-positive size", () => {
    expect.hasAssertions();

    expect(validateFile(0)).toStrictEqual({ isValid: false, message: EMPTY_FILE_MESSAGE });
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
});
