import {
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_TEMP_PREFIXES,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { PID } from "@/services/exec/test/constants.test";
import { parseTempOwnerPid } from "@/services/exec/util/parseTempOwnerPid";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

describe(parseTempOwnerPid, () => {
  test(`reads the owner pid from a capture temp`, () => {
    expect.hasAssertions();

    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
  });

  test(`reads the owner pid from a persist temp via the longest matching prefix`, () => {
    expect.hasAssertions();

    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.persist.${PID}.${TEST_FILENAME}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
  });

  test(`returns undefined for published bare layers, legacy random-only temps, and non-temps`, () => {
    expect.hasAssertions();

    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeUndefined();
    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeUndefined();
    expect(
      parseTempOwnerPid(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${TEST_FILENAME}`, VIRRUN_SNAPSHOT_TEMP_PREFIXES),
    ).toBeUndefined();
    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeUndefined();
  });
});
