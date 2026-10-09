import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { DRAIN_DEFERRED_MARKER } from "#src/services/coderabbit/collect/constants";
import { deferFindings } from "#src/services/coderabbit/collect/deferFindings";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(deferFindings, () => {
  // A run whose replies did not all land defers again, and the bot's reply-reviews give it a new review id each time
  test("opens no second issue while one carries the window's marker, and still replies to a thread left open", () => {
    expect.hasAssertions();

    const headSha = "headSha";
    runGh
      .mockReturnValueOnce(JSON.stringify({ name: "name", owner: { login: "owner" } }))
      .mockReturnValueOnce(headSha)
      .mockReturnValueOnce(JSON.stringify([{ body: getMarker(DRAIN_DEFERRED_MARKER, headSha), number: 0 }]));
    deferFindings({
      attempts: 0,
      cause: "cause",
      isDryRun: false,
      openThreads: [
        {
          body: "",
          commentId: 1,
          lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN,
          lastBody: "",
          path: "",
          replyAuthorLogins: [],
        },
      ],
      pullRequest: 0,
      viewerLogin: "viewerLogin",
    });

    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "repo",
            "view",
            "--json",
            "owner,name",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/pulls/0",
            "--jq",
            ".head.sha",
          ],
        ],
        [
          [
            "issue",
            "list",
            "--state",
            "open",
            "--author",
            "viewerLogin",
            "--label",
            "ready-for-agent",
            "--limit",
            "1000",
            "--json",
            "number,body",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/pulls/0/comments/1/replies",
            "-f",
            "body=Deferred after 0 attempts — cause",
          ],
        ],
      ]
    `);
  });
});
