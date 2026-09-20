import type { PickRecord } from "#src/models/PickRecord";

import { DAY_IN_MILLISECONDS, PICK_RETENTION_DAYS } from "#src/services/constants";
import { pruneStalePickRecords } from "#src/services/pruneStalePickRecords";
import { describe, expect, test } from "vitest";

const getIsoDate = (daysAfterEpoch: number) =>
  new Date(daysAfterEpoch * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);
const createRecord = (daysAfterEpoch: number): PickRecord => ({
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
