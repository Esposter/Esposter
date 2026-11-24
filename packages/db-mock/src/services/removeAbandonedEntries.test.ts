import { BUILD_PREFIX, COPY_PREFIX, TEMPLATE_ROOT } from "#src/services/constants";
import { removeAbandonedEntries } from "#src/services/removeAbandonedEntries";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, rmSync, utimesSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(removeAbandonedEntries, () => {
  // A process id no process holds, which the process check reads as gone
  const DEAD_PROCESS_ID = 2 ** 30;
  let createdNames: string[];

  const createEntry = (name: string, modified: Date) => {
    const path = join(TEMPLATE_ROOT, name);
    mkdirSync(path, { recursive: true });
    utimesSync(path, modified, modified);
    createdNames.push(name);
  };

  beforeEach(() => {
    createdNames = [];
  });

  afterEach(() => {
    for (const name of createdNames) rmSync(join(TEMPLATE_ROOT, name), { force: true, recursive: true });
  });

  // A copy or a build of a process that has exited is nothing a run reads. A template is reaped only once no run has
  // Read it for its age, so a template in use is kept, and a template unused past its age is removed
  test("removes a copy or build of an exited process and a template unused past its age, and keeps the rest", () => {
    expect.hasAssertions();

    const now = new Date();
    const staleTemplate = createHash("sha256").update("").digest("hex");
    const recentTemplate = createHash("sha256").update(" ").digest("hex");
    const removed = [`${COPY_PREFIX}-${DEAD_PROCESS_ID}-a`, `${BUILD_PREFIX}-${DEAD_PROCESS_ID}-a`, staleTemplate];
    const kept = [`${BUILD_PREFIX}-${process.pid}-a`, recentTemplate];
    for (const name of [...removed, ...kept]) createEntry(name, name === staleTemplate ? new Date(0) : now);

    removeAbandonedEntries();

    expect([...removed, ...kept].filter((name) => existsSync(join(TEMPLATE_ROOT, name)))).toStrictEqual(kept);
  });
});
