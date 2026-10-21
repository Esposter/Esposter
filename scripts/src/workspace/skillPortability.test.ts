import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A skill is read on every machine that clones the repository, so it names only what the repository holds. A home
// directory, a user's global configuration, a drive letter, a session's scratch directory or a Linux subsystem names
// one machine's layout, and a reader anywhere else follows it to nothing. The `.agents` tree and its `.claude` alias,
// and the platforms the repository runs on, are project facts and are not matched here. A home path is `~/` before a
// dot-directory or a capitalised folder; `~/` before a lowercase name is the application's own import alias.
describe("skillPortability", () => {
  test("no skill names a path, setting or session outside the repository", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const MACHINE_LOCAL_FORMS: RegExp[] = [
      /~\/(?=[.A-Z])/u,
      /\$HOME\b/u,
      /%USERPROFILE%|%APPDATA%|AppData/u,
      /(?<![\w])[A-Za-z]:[\\/]/u,
      /\/(?:Users|home|mnt)\//u,
      /\bWSL\b/u,
      /\$SCRATCHPAD\b/u,
    ];

    // Named as the file and line that holds the form, rather than counted, so the failure says where to look.
    const violations = readSweepFilePaths(SKILLS_DIRECTORY)
      .filter((path) => path.endsWith(".md"))
      .flatMap((path) =>
        readFileSync(join(REPOSITORY_ROOT, path), "utf8")
          .split("\n")
          .flatMap((line, index) =>
            MACHINE_LOCAL_FORMS.filter((form) => form.test(line)).map((form) => `${path}:${index + 1} ${form.source}`),
          ),
      );

    expect(violations).toStrictEqual([]);
  });
});
