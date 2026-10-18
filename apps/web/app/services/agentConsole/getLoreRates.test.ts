import type { LoreRate } from "@/models/agentConsole/LoreRate";

import { GENSHIN_LORE_RATES_LINE_PREFIX } from "@/services/agentConsole/constants";
import { getLoreRates } from "@/services/agentConsole/getLoreRates";
import { describe, expect, test } from "vitest";

describe(getLoreRates, () => {
  const loreRates: LoreRate[] = [{ displayName: "displayName", name: "name", probability: 0.5 }];

  // The rows are the welcome's own, carried as the persona plugin writes them, so a theme shows the odds the person reads
  test("reads the rows the session-start context carries, in their order", () => {
    expect.hasAssertions();

    expect(
      getLoreRates(`Character: name\n${GENSHIN_LORE_RATES_LINE_PREFIX}${JSON.stringify(loreRates)}`),
    ).toStrictEqual(loreRates);
  });

  // A pinned character, or one a birthday chose, has no rows: the nameplate shows and nothing falls for it
  test("reads no rows from a context that carries none", () => {
    expect.hasAssertions();

    expect(getLoreRates("Character: name")).toStrictEqual([]);
  });
});
