import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { getBloomReferenceIds } from "#src/services/genshinParity/passes/getBloomReferenceIds";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "login-door": { screen: "LoginScreen", wikiTitle: "File:Door.png" },
    "mondstadt-city-location": { screen: "WorldScreen", source: "wiki location image" },
  } satisfies Record<string, ParityReference>,
}));

describe(getBloomReferenceIds, () => {
  test("reads a reference whose screen takes the bloom switch", () => {
    expect.hasAssertions();

    expect(getBloomReferenceIds(["login-door"])).toStrictEqual(["login-door"]);
  });

  test("drops a world reference, whose chain draws no bloom to read", () => {
    expect.hasAssertions();

    expect(getBloomReferenceIds(["login-door", "mondstadt-city-location"])).toStrictEqual(["login-door"]);
  });
});
