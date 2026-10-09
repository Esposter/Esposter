import type { runGh as baseRunGh } from "#src/services/shared/runGh";
import type { runGit as baseRunGit } from "#src/services/shared/runGit";

import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { describe, expect, test, vi } from "vitest";

const { runGh, runGit } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>(), runGit: vi.fn<typeof baseRunGit>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/shared/runGit"), () => ({ runGit: runGit as unknown as typeof baseRunGit }));

// Both tools write to one log, so the order between a push and the issue is read off it whole
const recordCommands = (): string[][] => {
  const commands: string[][] = [];
  runGit.mockImplementation((args) => {
    commands.push(args);
    return "";
  });
  runGh.mockImplementation((args) => {
    commands.push(args);
    return "[]";
  });
  return commands;
};

describe(parkCommits, () => {
  const shas = ["a".repeat(40), "b".repeat(40)];

  // A caller drops the commits from the replay once this returns, so each must be on its held branch before anything
  // Else is written
  test("pushes every commit to its held branch before it opens the issue", () => {
    expect.hasAssertions();

    const commands = recordCommands();
    parkCommits({ cause: "", cwd: "", isDryRun: false, shas, viewerLogin: "" });

    expect(commands).toMatchInlineSnapshot(`
      [
        [
          "log",
          "-1",
          "--format=%s",
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        ],
        [
          "log",
          "-1",
          "--format=%s",
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        ],
        [
          "push",
          "origin",
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:refs/heads/ai/held/aaaaaaaaaa",
        ],
        [
          "push",
          "origin",
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:refs/heads/ai/held/bbbbbbbbbb",
        ],
        [
          "issue",
          "list",
          "--state",
          "open",
          "--author",
          "",
          "--label",
          "ready-for-agent",
          "--limit",
          "1000",
          "--json",
          "number,body",
        ],
        [
          "issue",
          "create",
          "--title",
          "Held:  (2 commits)",
          "--label",
          "ready-for-agent",
          "--body",
          "<!-- review-collector held commit:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa -->


      - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa , held on \`ai/held/aaaaaaaaaa\`
      - bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb , held on \`ai/held/bbbbbbbbbb\`

      The collector tries the re-land itself as \`main\` moves, up to its attempts, and closes this issue once every commit is back. To re-land them by hand, on \`ai/queue\`:

      1. \`git fetch origin\`
      2. For each held branch above, in order: \`git cherry-pick --no-commit origin/<branch>\`, settle what the cause names by splitting it under the cap or resolving the conflict, then commit each part under a message of its own, \`git commit -m "<subject>"\` — never the message the pick prepares, nor \`-x\`: either can carry a "(cherry picked from commit …)" line naming a sha the held branch carries, and a commit naming one is owed nowhere until that branch is deleted
      3. \`pnpm ai:queue:push\`, after which each new commit ports like any other
      4. \`git push origin --delete <branch>\` for each held branch, then close this issue",
        ],
      ]
    `);
  });

  test("pushes nothing and posts nothing on a dry run", () => {
    expect.hasAssertions();

    const commands = recordCommands();
    parkCommits({ cause: "", cwd: "", isDryRun: true, shas, viewerLogin: "" });

    expect(commands).toMatchInlineSnapshot(`
      [
        [
          "log",
          "-1",
          "--format=%s",
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        ],
        [
          "log",
          "-1",
          "--format=%s",
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        ],
        [
          "issue",
          "list",
          "--state",
          "open",
          "--author",
          "",
          "--label",
          "ready-for-agent",
          "--limit",
          "1000",
          "--json",
          "number,body",
        ],
      ]
    `);
  });
});
