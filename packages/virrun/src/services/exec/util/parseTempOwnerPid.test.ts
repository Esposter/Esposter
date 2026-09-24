import {
  VIRRUN_SNAPSHOT_CAPTURE_UPPER_TEMP_PREFIX,
  VIRRUN_SNAPSHOT_CAPTURE_WORK_TEMP_PREFIX,
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_PERSIST_UPPER_TEMP_PREFIX,
  VIRRUN_SNAPSHOT_PERSIST_WORK_TEMP_PREFIX,
  VIRRUN_SNAPSHOT_TEMP_PREFIXES,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "#src/services/exec/snapshot/constants";
import { PID } from "#src/services/exec/test/constants.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import { describe, expect, test } from "vitest";

describe(parseTempOwnerPid, () => {
  test(`reads the owner pid from a capture temp`, () => {
    expect.hasAssertions();

    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_CAPTURE_UPPER_TEMP_PREFIX}${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_CAPTURE_WORK_TEMP_PREFIX}${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
  });

  test(`reads the owner pid from a persist temp via the longest matching prefix`, () => {
    expect.hasAssertions();

    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_PERSIST_UPPER_TEMP_PREFIX}${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_PERSIST_WORK_TEMP_PREFIX}${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
  });

  test(`returns undefined for published bare layers, legacy random-only temps, and non-temps`, () => {
    expect.hasAssertions();

    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeUndefined();
    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeUndefined();
    expect(
      parseTempOwnerPid(`${VIRRUN_SNAPSHOT_CAPTURE_UPPER_TEMP_PREFIX}${TEST_FILENAME}`, VIRRUN_SNAPSHOT_TEMP_PREFIXES),
    ).toBeUndefined();
    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeUndefined();
  });
});
