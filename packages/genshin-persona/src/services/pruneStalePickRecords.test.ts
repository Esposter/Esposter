import type { PickRecord } from "#src/models/PickRecord";

import { PICK_RETENTION_DAYS } from "#src/services/constants";
import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { pruneStalePickRecords } from "#src/services/pruneStalePickRecords";
import { describe, expect, test } from "vitest";

const getIsoDate = (daysAfterEpoch: number) => TEST_EPOCH_DATE.add({ days: daysAfterEpoch }).toString();
const createRecord = (daysAfterEpoch: number): PickRecord => ({
  element: "",
  isoDate: getIsoDate(daysAfterEpoch),
  name: "",
  sessionId: "",
});

describe(pruneStalePickRecords, () => {
  test("keeps a record for a week and drops it the day after", () => {
    expect.hasAssertions();

    const today = getIsoDate(PICK_RETENTION_DAYS + 1);
    const records = [createRecord(0), createRecord(1), createRecord(PICK_RETENTION_DAYS + 1)];

    expect(pruneStalePickRecords(records, today)).toStrictEqual([
      createRecord(1),
      createRecord(PICK_RETENTION_DAYS + 1),
    ]);
  });
});
