import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";

import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { z } from "zod";

const TALENT_REFERENCE_REGEX = /^(?<type>attack|burst|skill)\((?<label>.+?)(?:\|(?<selector>\d+))?\)$/u;

// The leaves of a talent variable's value, a reference or a list nesting more, each with its place in the nesting.
// A value naming no talent's table, a passive's `a1#0`, has none
export const readTalentLeaves = (value: unknown, path: number[]): GcsimTalentLeaf[] => {
  if (Array.isArray(value)) return value.flatMap((element, index) => readTalentLeaves(element, [...path, index]));
  const groups = typeof value === "string" ? TALENT_REFERENCE_REGEX.exec(value)?.groups : undefined;
  if (groups?.type === undefined || groups.label === undefined) return [];
  return [
    {
      path,
      reference: {
        label: groups.label,
        selector: Number(groups.selector ?? 0),
        type: z.enum(GcsimTalentType).parse(groups.type),
      },
    },
  ];
};
