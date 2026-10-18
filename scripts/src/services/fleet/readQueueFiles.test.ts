import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { readQueueFiles } from "#src/services/fleet/readQueueFiles";
import { QUEUE_BRANCH, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readQueueFiles, () => {
  const { commitFile, getCwd, publish, switchTo } = setupFixtureRepository();
  const PAGE_PATH = "compute/genshin/design.md";
  const DONE_LINE = "- [ ] `[cpu]` {done-run} — **Done.**";
  const OPEN_LINE = "- [ ] `[cpu]` {open-run} — **Open.**";

  test("reads an item another worker finished off origin as gone, while a checkout behind origin still lists it", () => {
    expect.hasAssertions();

    const staleSha = commitFile(PAGE_PATH, `## Queue\n\n${DONE_LINE}\n${OPEN_LINE}\n`);
    commitFile(PAGE_PATH, `## Queue\n\n${OPEN_LINE}\n`);
    publish(QUEUE_BRANCH, "HEAD");
    switchTo(staleSha);

    expect(readFileSync(join(getCwd(), PAGE_PATH), "utf8")).toContain(DONE_LINE);
    expect(
      readComputeQueue(readQueueFiles("compute", REMOTE_QUEUE_REF, getCwd())).entries.map(({ id }) => id),
    ).toStrictEqual(["open-run"]);
  });
});
