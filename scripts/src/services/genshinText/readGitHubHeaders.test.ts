import { readGitHubHeaders } from "#src/services/genshinText/readGitHubHeaders";
import { describe, expect, test } from "vitest";

describe(readGitHubHeaders, () => {
  const TOKEN = "token";

  test("authorizes a request with the token it is given", () => {
    expect.hasAssertions();

    expect(readGitHubHeaders(TOKEN)).toStrictEqual({ Authorization: `Bearer ${TOKEN}` });
  });

  test("sends no header when there is no token, or an empty one", () => {
    expect.hasAssertions();

    expect(readGitHubHeaders(undefined)).toBeUndefined();
    expect(readGitHubHeaders("")).toBeUndefined();
  });
});
