import { renameDumpKeys } from "#src/services/genshinText/renameDumpKeys";
import { describe, expect, test } from "vitest";

describe(renameDumpKeys, () => {
  test("reads each field under the decoded name its key map gives, from the dump's own key", () => {
    expect.hasAssertions();

    expect(
      renameDumpKeys<{ endTimeStr: number; scheduleId: number }>([{ IENPIBICGCC: 2, scheduleId: 1 }], {
        endTimeStr: "IENPIBICGCC",
        scheduleId: "scheduleId",
      }),
    ).toStrictEqual([{ endTimeStr: 2, scheduleId: 1 }]);
  });
});
