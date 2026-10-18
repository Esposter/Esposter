import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { checkIsLandingOrdered } from "#src/services/genshinAssets/kits/gcsim/checkIsLandingOrdered";
import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";

const FRAME_LIST_REGEX = /^frames\.(?<name>[^.]+)\.(?<index>\d+)$/u;
// The word a list's name ends with for the hits it holds: `boundlessOriginHitmarks` holds the hits of `boundlessOrigin`
const HIT_WORD_REGEX = /(?:Hitmarks|Hitmark|Hits|Hit)$/u;

// The camel-cased words of a name, `Boundless Origin` as `boundlessOrigin`
const toCamelCase = (text: string): string =>
  text
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean)
    .map((word, index) => (index === 0 ? word.charAt(0).toLowerCase() : word.charAt(0).toUpperCase()) + word.slice(1))
    .join("");

// The names an attack's `Abil` gives it, its text before its parenthesis and the parenthesis' own text: `Boundless
// Origin` and `C6` in `Boundless Origin (C6)`
const readAbilNames = (abil: string): string[] => {
  const [base = "", parenthesis = ""] = abil.split("(");
  return [base, parenthesis.replace(")", "")].map(toCamelCase).filter((name) => name !== "");
};

// A frame list the kit holds with no named constant of its name takes the delays of the queue calls whose attack an
// `Abil` names by the list's name without its hit word, as many calls as the list has hits, in the order they land. Where
// The calls do not number as the hits, or do not land in a known order, the list has none
export const addGcsimFrameListCandidates = (
  { add, toFile }: GcsimKitCandidateWriter,
  { attacks, queuedAttacks }: GcsimCharacter,
  bagPaths: ReadonlySet<string>,
): void => {
  const listPathMap = new Map<string, string[]>();
  for (const path of bagPaths) {
    const name = FRAME_LIST_REGEX.exec(path)?.groups?.name;
    if (name !== undefined) listPathMap.set(name, [...(listPathMap.get(name) ?? []), path]);
  }
  for (const [name, paths] of listPathMap) {
    const stem = name.replace(HIT_WORD_REGEX, "");
    const calls = queuedAttacks
      .filter((queuedAttack) => {
        const abil = findQueuedAttack(attacks, queuedAttack)?.abil;
        return abil !== undefined && queuedAttack.delay !== undefined && readAbilNames(abil).includes(stem);
      })
      .toSorted((left, right) => (left.delay ?? 0) - (right.delay ?? 0));
    if (calls.length !== paths.length || !checkIsLandingOrdered(calls)) continue;
    for (const [index, { delay, delayLine, file }] of calls.entries()) {
      const path = `frames.${name}.${index}`;
      if (delay !== undefined && bagPaths.has(path)) add(path, delay, toFile(file), delayLine);
    }
  }
};
