import type { ExpeditionLimitAdd } from "#src/models/expedition/ExpeditionLimitAdd";

import { computeExpeditionLimit } from "#src/services/expedition/computeExpeditionLimit";
import { EXPEDITION_BASE_LIMIT } from "#src/services/expedition/constants";
import { describe, expect, test } from "vitest";

describe(computeExpeditionLimit, () => {
  const RAISE_RANK = 26;
  const limitAdds: ExpeditionLimitAdd[] = [{ expeditionLimitAdd: 1, level: RAISE_RANK }];

  test("should hold the base limit below the first rank that raises it", () => {
    expect.hasAssertions();

    expect(computeExpeditionLimit(RAISE_RANK - 1, limitAdds)).toBe(EXPEDITION_BASE_LIMIT);
  });

  test("should raise the limit by a rank's addition from that rank on", () => {
    expect.hasAssertions();

    expect(computeExpeditionLimit(RAISE_RANK, limitAdds)).toBe(EXPEDITION_BASE_LIMIT + 1);
  });
});
