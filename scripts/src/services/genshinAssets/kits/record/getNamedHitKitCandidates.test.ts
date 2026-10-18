import type { NamedHitCall } from "#src/models/genshinAssets/kits/NamedHitCall";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { describe, expect, test } from "vitest";

// A call that lands at the delay, from the declaration at the site, giving its hitmark as the candidate. Its site is
// Its file and the line of its declaration, `burst.go:4`, and the call is read at the line of its own
const call = (site: string, delay: number, line = 5): NamedHitCall => {
  const [file = ""] = site.split(":");
  return {
    delay,
    fieldMap: new Map([
      ["hitmarkFrames", [{ provenance: { file: "burst.go", line: delay, source: KitSource.Gcsim }, value: delay }]],
    ]),
    file,
    line,
    site,
  };
};

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

  test("gives a named list its length from the calls its one key makes, where a loop of one call makes as many as its hits", () => {
    expect.hasAssertions();

    // A loop of one call makes the key's three calls, as a lunge's three strikes in a loop of three do
    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      [
        "9832|6",
        {
          fieldMap: new Map(),
          queuedCalls: [call("skill.go:100", 11, 113), call("skill.go:100", 11, 113), call("skill.go:100", 11, 113)],
        },
      ],
    ]);
    const valueMap = new Map<string, unknown>([
      ["hits.impaleTheNightFullBol.0.multiplier", { index: 6, proudSkillGroupId: 9832 }],
      ["hits.impaleTheNightFullBol.1.multiplier", { index: 6, proudSkillGroupId: 9832 }],
      ["hits.impaleTheNightFullBol.2.multiplier", { index: 6, proudSkillGroupId: 9832 }],
    ]);

    expect(
      getNamedHitKitCandidates(valueMap, namedHitCandidateMap).get("hits.impaleTheNightFullBol.length"),
    ).toStrictEqual([{ provenance: { file: "skill.go", line: 113, source: KitSource.Gcsim }, value: 3 }]);
  });

  test("gives no length to a hit with no index, `hits.sword`, which is a hit of its own rather than a list", () => {
    expect.hasAssertions();

    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      ["9832|0", { fieldMap: new Map(), queuedCalls: [call("skill.go:100", 11, 113)] }],
    ]);
    const valueMap = new Map<string, unknown>([["hits.sword.multiplier", { index: 0, proudSkillGroupId: 9832 }]]);

    expect(getNamedHitKitCandidates(valueMap, namedHitCandidateMap).has("hits.sword.length")).toBe(false);
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
  test("takes no call where a second site of the key makes as many calls, though its own call has no delay", () => {
    expect.hasAssertions();

    // A skill's own call at a delay, and its A4 blade fired from a function whose delay is a parameter, so no delay reads
    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      [
        "3|0",
        {
          fieldMap: new Map(),
          queuedCalls: [call("skill.go:33", 36), { fieldMap: new Map(), file: "asc.go", line: 18, site: "asc.go:18" }],
        },
      ],
    ]);
    const valueMap = new Map<string, unknown>([["hits.blade.0.multiplier", { index: 0, proudSkillGroupId: 3 }]]);

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

  test("takes the call that fires at a hit's own hitmark, past a call of another delay its site also makes", () => {
    expect.hasAssertions();

    // A summon's two hits and its melody's zero-damage tick, all fired from one attack of the variable at one site
    const namedHitCandidateMap: NamedHitCandidateMap = new Map([
      [
        "1|0",
        {
          fieldMap: new Map(),
          queuedCalls: [call("skill.go:41", 0), call("skill.go:41", 42), call("skill.go:41", 78)],
        },
      ],
    ]);
    const valueMap = new Map<string, unknown>([
      ["hits.droplet.0.hitmarkFrames", 42],
      ["hits.droplet.0.multiplier", { index: 0, proudSkillGroupId: 1 }],
      ["hits.droplet.1.hitmarkFrames", 78],
      ["hits.droplet.1.multiplier", { index: 0, proudSkillGroupId: 1 }],
    ]);

    const candidateMap = getNamedHitKitCandidates(valueMap, namedHitCandidateMap);

    expect(hitmarks(candidateMap, "hits.droplet.0.hitmarkFrames")).toStrictEqual([42]);
    expect(hitmarks(candidateMap, "hits.droplet.1.hitmarkFrames")).toStrictEqual([78]);
  });
});
