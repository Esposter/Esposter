import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getBotBodies } from "#src/services/coderabbit/shared/getBotBodies";
import { describe, expect, test } from "vitest";

describe(getBotBodies, () => {
  // A walkthrough block is public text, so one posted under any other login is read as nobody's
  test("reads the bot's comments alone", () => {
    expect.hasAssertions();

    const issueComments: GitHubEntry[] = [
      { body: "body", id: 0, updated_at: "", user: { login: CODERABBIT_REST_LOGIN } },
      { body: " ", id: 0, updated_at: "", user: { login: "login" } },
    ];

    expect(getBotBodies(issueComments)).toStrictEqual(["body"]);
  });
});
