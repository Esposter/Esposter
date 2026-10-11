import { checkIsRequestTooLarge } from "#src/runtime/services/checkIsRequestTooLarge";
import { describe, expect, test } from "vitest";

describe(checkIsRequestTooLarge, () => {
  const LIMITS = { maxRequestSizeInBytes: 10, maxUploadFileRequestInBytes: 20 };
  const JSON_TYPE = "application/json";
  const UPLOAD_TYPE = "multipart/form-data; boundary=x";

  test("a request at its limit is too large, and one under it is not", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("POST", "10", JSON_TYPE, LIMITS)).toBe(true);
    expect(checkIsRequestTooLarge("POST", "9", JSON_TYPE, LIMITS)).toBe(false);
  });

  test("a file upload has its own, larger limit", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("POST", "15", UPLOAD_TYPE, LIMITS)).toBe(false);
    expect(checkIsRequestTooLarge("POST", "20", UPLOAD_TYPE, LIMITS)).toBe(true);
  });

  test("a method that carries no body is never measured", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("GET", "100", JSON_TYPE, LIMITS)).toBe(false);
  });

  test("a request with no declared length is not refused here", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("POST", null, JSON_TYPE, LIMITS)).toBe(false);
  });
});
