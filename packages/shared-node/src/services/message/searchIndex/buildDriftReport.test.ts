import { buildDriftReport } from "@/services/message/searchIndex/buildDriftReport";
import { describe, expect, test } from "vitest";

describe(buildDriftReport, () => {
  const tableHeavyRoomId = crypto.randomUUID();
  const indexOnlyRoomId = crypto.randomUUID();
  const syncedRoomId = crypto.randomUUID();

  test("reports positive, negative, and zero drift ordered by descending absolute drift", () => {
    expect.hasAssertions();

    const reports = buildDriftReport(
      new Map([
        [tableHeavyRoomId, 2],
        [syncedRoomId, 1],
      ]),
      new Map([
        [indexOnlyRoomId, 1],
        [syncedRoomId, 1],
      ]),
    );

    expect(reports).toStrictEqual([
      { drift: 2, indexCount: 0, isDrifted: true, roomId: tableHeavyRoomId, tableCount: 2 },
      { drift: -1, indexCount: 1, isDrifted: true, roomId: indexOnlyRoomId, tableCount: 0 },
      { drift: 0, indexCount: 1, isDrifted: false, roomId: syncedRoomId, tableCount: 1 },
    ]);
  });
});
