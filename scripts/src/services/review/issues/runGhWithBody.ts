import { runGh } from "#src/services/shared/runGh";
import { withFinalizer } from "@esposter/shared";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// One `gh` call that takes a markdown body, passed through a file so `gh` reads it without a length limit on the command line.
// Returns what `gh` prints.
export const runGhWithBody = (args: string[], body: string): string => {
  const bodyPath = join(tmpdir(), `review-body-${crypto.randomUUID()}.md`);
  writeFileSync(bodyPath, body);
  return withFinalizer(
    () => runGh([...args, "--body-file", bodyPath]).trim(),
    () => {
      rmSync(bodyPath, { force: true });
    },
  );
};
