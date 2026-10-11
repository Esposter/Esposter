import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { parseModuleOptions } from "#src/services/parseModuleOptions";
import { describe, expect, test } from "vitest";

describe(parseModuleOptions, () => {
  const DEV_SERVER_URL = "http://localhost:3000";

  test("the defaults parse to themselves, so the schema and the defaults cannot drift apart", () => {
    expect.hasAssertions();

    const defaults = getDefaultModuleOptions(true, DEV_SERVER_URL);

    expect(parseModuleOptions(defaults)).toStrictEqual(defaults);
  });

  test("a misspelt option is refused rather than ignored", () => {
    expect.hasAssertions();

    expect(() =>
      parseModuleOptions({ ...getDefaultModuleOptions(true, DEV_SERVER_URL), enabeld: true }),
    ).toThrowErrorMatchingInlineSnapshot(`[TypeError: nuxt-security-module: (options): Unrecognized key: "enabeld"]`);
  });

  test("a request size limit that is not a positive whole number is refused with its path", () => {
    expect.hasAssertions();

    const requestSizeLimiter = { maxRequestSizeInBytes: 1.5, maxUploadFileRequestInBytes: 8_000_000 };

    expect(() =>
      parseModuleOptions({ ...getDefaultModuleOptions(true, DEV_SERVER_URL), requestSizeLimiter }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: nuxt-security-module: requestSizeLimiter.maxRequestSizeInBytes: must be a whole number of bytes]`,
    );
  });
});
