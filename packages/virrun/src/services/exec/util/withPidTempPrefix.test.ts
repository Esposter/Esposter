import { VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import { withPidTempPrefix } from "#src/services/exec/util/withPidTempPrefix";
import { describe, expect, test } from "vitest";

describe(withPidTempPrefix, () => {
  const prefix = `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`;

  test(`round-trips back to the current pid through parseTempOwnerPid`, () => {
    expect.hasAssertions();

    const name = `${withPidTempPrefix(prefix)}test`;

    expect(parseTempOwnerPid(name, [prefix])).toBe(process.pid);
  });
});
