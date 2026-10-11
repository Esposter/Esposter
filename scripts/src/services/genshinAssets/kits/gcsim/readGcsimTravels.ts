import type { GcsimTravel } from "#src/models/genshinAssets/kits/gcsim/GcsimTravel";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

const FUNCTION_START_REGEX = /^func /gmu;
const TRAVEL_DEFAULT_REGEX = /^\s*travel\s*=\s*(?<frames>\d+)\s*$/mu;
const TRAVEL_USE_REGEX = /\b(?<name>\w+)(?:\[[^\]]*\])*\s*\+\s*travel\b/gu;

// The travel each of a gcsim character's hitmark constants lands its hit after, by the constant's name: an action
// Function that defaults `travel` to frames of its own and lands a hit at `attackHitmarks[...]+travel` gives
// `attackHitmarks` that travel. A constant two functions give different travels keeps the first
export const readGcsimTravels = (sources: readonly GoSource[]): Map<string, GcsimTravel> => {
  const travelMap = new Map<string, GcsimTravel>();
  for (const { name: file, source } of sources) {
    const starts = Array.from(source.matchAll(FUNCTION_START_REGEX), ({ index }) => index);
    for (const [startIndex, start] of starts.entries()) {
      const body = source.slice(start, starts[startIndex + 1] ?? source.length);
      const travelDefault = TRAVEL_DEFAULT_REGEX.exec(body);
      const frames = Number(travelDefault?.groups?.frames);
      if (travelDefault === null || Number.isNaN(frames)) continue;
      const line = source.slice(0, start + travelDefault.index).split("\n").length;
      for (const { groups } of body.matchAll(TRAVEL_USE_REGEX))
        if (groups?.name !== undefined && !travelMap.has(groups.name))
          travelMap.set(groups.name, { file, frames, line });
    }
  }
  return travelMap;
};
