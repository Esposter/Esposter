import { webpageRootPropsSchema } from "#shared/models/pageBuilder/WebpageRootProps";
import { MAX_TOKEN_NAME_LENGTH } from "#shared/services/pageBuilder/constants";
import { TEST_LANG } from "#shared/services/pageBuilder/constants.test";
import { describe, expect, test } from "vitest";

describe("webpageRootPropsSchema", () => {
  test.each(["color-brand", "font-body"])("a %s token is accepted", (name) => {
    expect.hasAssertions();

    expect(webpageRootPropsSchema.safeParse({ lang: TEST_LANG, tokens: { [name]: "red" } }).success).toBe(true);
  });

  test("a token named for neither a colour nor a font is refused", () => {
    expect.hasAssertions();

    expect(webpageRootPropsSchema.safeParse({ lang: TEST_LANG, tokens: { "size-large": "1rem" } }).success).toBe(false);
  });

  test("a token name longer than the most a name may hold is refused", () => {
    expect.hasAssertions();

    const name = `color-${"a".repeat(MAX_TOKEN_NAME_LENGTH)}`;

    expect(webpageRootPropsSchema.safeParse({ lang: TEST_LANG, tokens: { [name]: "red" } }).success).toBe(false);
  });
});
