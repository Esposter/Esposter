import {
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_PATH,
  OXFMT_CONFIGURATION_PATH,
  REPOSITORY_ROOT,
} from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { withFinalizer } from "@esposter/shared";
import { execFileSync } from "@esposter/shared-node/child-process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

describe("generated files", () => {
  const GENERATED_FOLDER_REGEX = /(?:^|\/)generated\//u;

  test(
    "every git-tracked file under a generated folder is already the formatter's output",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const generatedPaths = runGit(["ls-files", "-z"])
        .split("\0")
        .filter((path) => GENERATED_FOLDER_REGEX.test(path));
      // The formatter ignores a `generated/` path, so each file is formatted as a copy under a neutral name, which keeps
      // its extension and no folder the ignore patterns name
      const directory = mkdtempSync(join(tmpdir(), "canonical-copies-"));
      withFinalizer(
        () => {
          const copies = generatedPaths.map((path, index) => {
            const copy = join(directory, `${index}${extname(path)}`);
            copyFileSync(join(REPOSITORY_ROOT, path), copy);
            return { copy, path };
          });
          execFileSync(
            process.execPath,
            [OXFMT_BINARY_PATH, `--config=${OXFMT_CONFIGURATION_PATH}`, ...copies.map(({ copy }) => copy)],
            { cwd: REPOSITORY_ROOT, maxBuffer: MAX_BUFFER_BYTES },
          );

          expect(
            copies
              .filter(({ copy, path }) => !readFileSync(copy).equals(readFileSync(join(REPOSITORY_ROOT, path))))
              .map(({ path }) => path),
          ).toStrictEqual([]);
        },
        () => {
          rmSync(directory, { force: true, recursive: true });
        },
      );
    },
  );
});
