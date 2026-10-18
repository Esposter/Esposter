import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { describe, expect, test } from "vitest";

// A call that lands at the delay, from the declaration at the site, giving its hitmark as the candidate
const call = (site: string, delay: number) => ({
  delay,
  fieldMap: new Map([
    ["hitmarkFrames", [{ provenance: { file: "burst.go", line: delay, source: KitSource.Gcsim }, value: delay }]],
  ]),
  site,
});

const hitmarks = (candidateMap: Map<string, { value: unknown }[]>, path: string) =>
  candidateMap.get(path)?.map(({ value }) => value);

describe(getNamedHitKitCandidates, () => {
  test("takes the calls of keys from one site, merged in the order they land, where their counts sum to the list's length", () => {
    expect.hasAssertions();

    // Two keys of one site, one making two calls and one a call between them, as a summon's cuts and its last bloom
    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      ["1|0", { fieldMap: new Map(), queuedCalls: [call("burst.go:4", 10), call("burst.go:4", 30)] }],
      ["1|1", { fieldMap: new Map(), queuedCalls: [call("burst.go:4", 20)] }],
    ]);
    const valueMap = new Map<string, unknown>([
      ["hits.burst.0.multiplier", { index: 0, proudSkillGroupId: 1 }],
      ["hits.burst.1.multiplier", { index: 1, proudSkillGroupId: 1 }],
      ["hits.burst.2.multiplier", { index: 0, proudSkillGroupId: 1 }],
    ]);

    const candidateMap = getNamedHitKitCandidates(valueMap, namedHitCandidateMap);

    expect(hitmarks(candidateMap, "hits.burst.0.hitmarkFrames")).toStrictEqual([10]);
    expect(hitmarks(candidateMap, "hits.burst.1.hitmarkFrames")).toStrictEqual([20]);
    expect(hitmarks(candidateMap, "hits.burst.2.hitmarkFrames")).toStrictEqual([30]);
  });

  test("takes no calls from keys of two sites, though each site's keys' calls number as many as the list", () => {
    expect.hasAssertions();

    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      ["1|0", { fieldMap: new Map(), queuedCalls: [call("burst.go:4", 10)] }],
      ["1|1", { fieldMap: new Map(), queuedCalls: [call("burst.go:9", 20)] }],
    ]);
    const valueMap = new Map<string, unknown>([
      ["hits.burst.0.multiplier", { index: 0, proudSkillGroupId: 1 }],
      ["hits.burst.1.multiplier", { index: 1, proudSkillGroupId: 1 }],
    ]);

    expect(getNamedHitKitCandidates(valueMap, namedHitCandidateMap).size).toBe(0);
  });
  test("takes no calls from keys whose calls of one site land at one delay, as their order is unknown", () => {
    expect.hasAssertions();

    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      ["1|0", { fieldMap: new Map(), queuedCalls: [call("burst.go:4", 0)] }],
      ["1|1", { fieldMap: new Map(), queuedCalls: [call("burst.go:4", 0)] }],
    ]);
    const valueMap = new Map<string, unknown>([
      ["hits.burst.0.multiplier", { index: 0, proudSkillGroupId: 1 }],
      ["hits.burst.1.multiplier", { index: 1, proudSkillGroupId: 1 }],
    ]);

    expect(getNamedHitKitCandidates(valueMap, namedHitCandidateMap).size).toBe(0);
  });
});
