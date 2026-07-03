import { VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { parseTempOwnerPid } from "@/services/exec/util/parseTempOwnerPid";
import { withPidTempPrefix } from "@/services/exec/util/withPidTempPrefix";
import { describe, expect, test } from "vitest";

describe(withPidTempPrefix, () => {
  const prefix = `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`;

  test(`embeds the current pid after the reap prefix`, () => {
    expect.hasAssertions();

    expect(withPidTempPrefix(prefix)).toBe(`${prefix}${process.pid}.`);
  });

  test(`round-trips back to the current pid through parseTempOwnerPid`, () => {
    expect.hasAssertions();

    const name = `${withPidTempPrefix(prefix)}test`;
    expect(parseTempOwnerPid(name, [prefix])).toBe(process.pid);
  });
});
