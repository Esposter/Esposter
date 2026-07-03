import {
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_TEMP_PREFIXES,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { parseTempOwnerPid } from "@/services/exec/util/parseTempOwnerPid";
import { describe, expect, test } from "vitest";

describe(parseTempOwnerPid, () => {
  const PID = 1234;
  // Stands in for the tail mkdtempSync appends after the pid-tagged prefix; its value is irrelevant to the parse.
  const MKDTEMP_SUFFIX = "test";

  test(`reads the owner pid from a capture temp`, () => {
    expect.hasAssertions();

    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${PID}.${MKDTEMP_SUFFIX}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.${PID}.${MKDTEMP_SUFFIX}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
  });

  test(`reads the owner pid from a persist temp via the longest matching prefix`, () => {
    expect.hasAssertions();

    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.${PID}.${MKDTEMP_SUFFIX}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
    expect(
      parseTempOwnerPid(
        `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.persist.${PID}.${MKDTEMP_SUFFIX}`,
        VIRRUN_SNAPSHOT_TEMP_PREFIXES,
      ),
    ).toBe(PID);
  });

  test(`returns null for published bare layers, legacy random-only temps, and non-temps`, () => {
    expect.hasAssertions();

    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeNull();
    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeNull();
    expect(
      parseTempOwnerPid(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.${MKDTEMP_SUFFIX}`, VIRRUN_SNAPSHOT_TEMP_PREFIXES),
    ).toBeNull();
    expect(parseTempOwnerPid(VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME, VIRRUN_SNAPSHOT_TEMP_PREFIXES)).toBeNull();
  });
});
