import { createPidTempTag } from "#src/services/exec/util/createPidTempTag";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import { VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX } from "#src/services/exec/wsl/constants";
import { describe, expect, test } from "vitest";

describe(createPidTempTag, () => {
  // The tag is the half of the temp-name contract the reaper reads back, so the round trip is the test
  test("tags a temp with the pid parseTempOwnerPid reads back", () => {
    expect.hasAssertions();

    const name = `${VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX}${createPidTempTag()}`;

    expect(parseTempOwnerPid(name, [VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX])).toBe(process.pid);
  });

  test("tags every call differently", () => {
    expect.hasAssertions();

    expect(createPidTempTag()).not.toBe(createPidTempTag());
  });
});
