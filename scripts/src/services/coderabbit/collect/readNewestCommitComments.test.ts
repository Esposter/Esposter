import type { CommitCommentsPage } from "#src/models/coderabbit/collect/CommitCommentsPage";
import type { RepositoryView } from "#src/models/coderabbit/shared/RepositoryView";

import { readNewestCommitComments } from "#src/services/coderabbit/collect/readNewestCommitComments";
import { runGh } from "#src/services/shared/runGh";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: vi.fn<typeof runGh>() }));

const getPage = (createdAtMs: number, startCursor: null | string): string =>
  JSON.stringify({
    data: {
      repository: {
        commitComments: {
          nodes: [
            {
              author: null,
              body: "",
              createdAt: Temporal.Instant.fromEpochMilliseconds(createdAtMs).toString(),
              databaseId: createdAtMs,
            },
          ],
          pageInfo: { hasPreviousPage: startCursor !== null, startCursor },
        },
      },
    },
  } satisfies CommitCommentsPage);

describe(readNewestCommitComments, () => {
  test("reads pages back until one reaches the span, oldest first", () => {
    expect.hasAssertions();

    vi.mocked(runGh).mockImplementation((args) => {
      if (args[0] === "repo") return JSON.stringify({ name: "", owner: { login: "" } } satisfies RepositoryView);
      else if (args.includes("startCursor=2")) return getPage(1, "1");
      else if (args.includes("startCursor=3")) return getPage(2, "2");
      else return getPage(3, "3");
    });

    expect(readNewestCommitComments(1).map(({ id }) => id)).toStrictEqual([1, 2, 3]);
  });
});
