import type { GcsimTravel } from "#src/models/genshinAssets/kits/gcsim/GcsimTravel";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

const FUNCTION_START_REGEX = /^func /gmu;
const TRAVEL_DEFAULT_REGEX = /^\s*travel\s*=\s*(?<frames>\d+)\s*$/mu;
// What a `+ travel` adds to: the text before it back to the nearest argument, bracket or statement boundary
const TRAVEL_OPERAND_REGEX = /(?<operand>[^(),{};\n]*?)\s*\+\s*travel\b/gu;
// A struct field's value a body sets, in a literal `CanQueueAfter: aimedHitmarks[hold]` or as `a.CanQueueAfter = ...`
const FIELD_VALUE_REGEX = /(?:^|[\s{,.])(?<field>[A-Z]\w*)\s*(?::|=(?!=))\s*(?<value>[A-Za-z_][\w.]*)/gmu;
// An identifier of an operand: a field when a `.` precedes it, else a bare name not inside a longer word
const OPERAND_NAME_REGEX = /(?:(?<dot>\.)|(?<![\w.]))(?<name>[A-Za-z_]\w*)(?!\w)/gu;

// The names an operand's `+ travel` lands on: its bare identifiers, and for a struct field the root of each value its
// Body sets that field to. An index is no name, `aimedHitmarks[hold]` gives `aimedHitmarks`, and a base before a `.` is
// No name either, `a` in `a.CanQueueAfter`
const readOperandNames = (operand: string, fieldValueMap: ReadonlyMap<string, string[]>): string[] => {
  const flatOperand = operand.replaceAll(/\[[^\]]*\]/gu, "");
  return Array.from(flatOperand.matchAll(OPERAND_NAME_REGEX)).flatMap(({ groups, index = 0 }): string[] => {
    if (groups?.name === undefined) return [];
    if (groups.dot !== undefined) return fieldValueMap.get(groups.name) ?? [];
    return flatOperand[index + groups.name.length] === "." ? [] : [groups.name];
  });
};

// The travel each of a gcsim character's hitmark constants lands its hit after, by the constant's name: an action
// Function that defaults `travel` to frames of its own and lands a hit at `attackHitmarks[...]+travel` gives
// `attackHitmarks` that travel. Every name the operand before `+ travel` reads takes it, so a delay written as
// `chargeHitmark-windup+travel` gives `chargeHitmark` its travel, and a struct field read as `a.CanQueueAfter+travel`
// Gives the constants its body sets that field to. A constant two functions give different travels keeps the first
export const readGcsimTravels = (sources: readonly GoSource[]): Map<string, GcsimTravel> => {
  const travelMap = new Map<string, GcsimTravel>();
  for (const { path: file, source } of sources) {
    const starts = Array.from(source.matchAll(FUNCTION_START_REGEX), ({ index }) => index);
    for (const [startIndex, start] of starts.entries()) {
      const body = source.slice(start, starts[startIndex + 1] ?? source.length);
      const travelDefault = TRAVEL_DEFAULT_REGEX.exec(body);
      const frames = Number(travelDefault?.groups?.frames);
      if (travelDefault === null || Number.isNaN(frames)) continue;
      const line = source.slice(0, start + travelDefault.index).split("\n").length;
      const fieldValueMap = new Map<string, string[]>();
      for (const { groups } of body.matchAll(FIELD_VALUE_REGEX)) {
        const root = groups?.value?.split(".")[0];
        if (groups?.field !== undefined && root !== undefined)
          fieldValueMap.set(groups.field, [...(fieldValueMap.get(groups.field) ?? []), root]);
      }
      for (const { groups } of body.matchAll(TRAVEL_OPERAND_REGEX))
        for (const name of readOperandNames(groups?.operand ?? "", fieldValueMap))
          if (!travelMap.has(name)) travelMap.set(name, { file, frames, line });
    }
  }
  return travelMap;
};
