import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";
import type { GcsimTalentVariable } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentVariable";

import { gcsimHitboxSchema } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { parseGcsimYaml } from "#src/services/genshinAssets/kits/gcsim/parseGcsimYaml";
import { z } from "zod";

const TALENT_REFERENCE_REGEX = /^(?<type>attack|burst|skill)\((?<label>.+?)(?:\|(?<selector>\d+))?\)$/u;

const configSchema = z.object({
  abilities: z
    .array(z.object({ hitbox: z.array(z.record(z.string(), z.unknown())).optional(), name: z.string() }))
    .default([]),
  name: z.string().optional(),
  shortcuts: z.array(z.string()).default([]),
  talents: z.array(z.record(z.string(), z.unknown())).default([]),
});

// The leaves of a talent variable's value, a reference or a list nesting more, each with its place in the nesting.
// A value naming no talent's table, a passive's `a1#0`, has none
const readTalentLeaves = (value: unknown, path: number[]): GcsimTalentLeaf[] => {
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

// What the builder reads of a gcsim character's `config.yml`: each ability's hitboxes, their sideways and forward
// Offset, radius or box and fan angle as written, the character's names, and each talent variable's multipliers. Each
// Keeps the line it is named on, found by walking the config's lines in the order the parse read them
export const readGcsimConfig = (yaml: string): GcsimConfig => {
  const { abilities, name: characterName, shortcuts, talents } = configSchema.parse(parseGcsimYaml(yaml));
  const lines = yaml.split("\n");
  let lineIndex = 0;
  const findLine = (pattern: RegExp): number => {
    const foundIndex = lines.findIndex((line, index) => index >= lineIndex && pattern.test(line));
    if (foundIndex === -1) return 0;
    lineIndex = foundIndex + 1;
    return foundIndex + 1;
  };
  lineIndex = lines.indexOf("talents:");
  const talentVariables: GcsimTalentVariable[] = talents.flatMap((talent) =>
    Object.entries(talent).map(([name, value]) => ({
      leaves: readTalentLeaves(value, []),
      line: findLine(new RegExp(`^\\s*-?\\s*${RegExp.escape(name)}:`, "u")),
      name,
    })),
  );
  const abilityHitboxesMap = new Map<string, GcsimHitbox[]>();
  lineIndex = lines.indexOf("abilities:");
  for (const { hitbox = [], name } of abilities)
    abilityHitboxesMap.set(
      name,
      hitbox.map(({ box, center, fan_angle, name: hitboxName, offset, radius, shape }) =>
        gcsimHitboxSchema.parse({
          ...(box !== undefined && { box }),
          center,
          ...(fan_angle !== undefined && { fanAngle: fan_angle }),
          line: findLine(new RegExp(`^\\s*-\\s*name:\\s*["']?${RegExp.escape(String(hitboxName))}["']?\\s*$`, "u")),
          name: hitboxName,
          ...(offset !== undefined && { offset }),
          ...(radius !== undefined && { radius }),
          shape,
        }),
      ),
    );
  return {
    abilityHitboxesMap,
    names: characterName === undefined ? shortcuts : [characterName, ...shortcuts],
    talentVariables,
  };
};
