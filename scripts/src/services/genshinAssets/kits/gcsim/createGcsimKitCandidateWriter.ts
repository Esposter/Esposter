import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimMultiplierKey } from "#src/models/genshinAssets/kits/gcsim/GcsimMultiplierKey";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import {
  GCSIM_CHARACTERS_PATH,
  GCSIM_DURABILITY_PER_GAUGE,
  GCSIM_NO_INTERNAL_COOLDOWN_TAG,
} from "#src/services/genshinAssets/kits/constants";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { GcsimAttackTagLunarReactionTypeMap } from "#src/services/genshinAssets/kits/gcsim/GcsimAttackTagLunarReactionTypeMap";
import { GcsimTalentTypeCombatTalentMap } from "#src/services/genshinAssets/kits/gcsim/GcsimTalentTypeCombatTalentMap";
import { joinGcsimVariableTalentArray } from "#src/services/genshinAssets/kits/gcsim/joinGcsimVariableTalentArray";
import { readFirstGoFrames } from "#src/services/genshinAssets/kits/gcsim/readFirstGoFrames";
import { readGcsimTalentParameter } from "#src/services/genshinAssets/kits/gcsim/readGcsimTalentParameter";
import { toGcsimArea } from "#src/services/genshinAssets/kits/gcsim/toGcsimArea";
import { toGcsimElement } from "#src/services/genshinAssets/kits/gcsim/toGcsimElement";
import { toGcsimInternalCooldownTag } from "#src/services/genshinAssets/kits/gcsim/toGcsimInternalCooldownTag";

// The writer of one gcsim character's values into a kit's candidate map, each cited at the file and line it is read from
export const createGcsimKitCandidateWriter = (
  candidateMap: Map<string, KitCandidate[]>,
  { configFile, constantMap, folder, talentArrayMap, talentFile, talentParameterMap }: GcsimCharacter,
  { talentGroupIdMap, talentMultiplierMap }: KitTables,
  defaultCause?: KitProvisionalCause,
): GcsimKitCandidateWriter => {
  const toFile = (name: string, from = folder) => `${GCSIM_CHARACTERS_PATH}/${from}/${name}`;
  const add = (path: string, value: unknown, file: string, line: number, cause = defaultCause) => {
    addKitCandidate(candidateMap, path, {
      provenance: { ...(cause && { cause }), file, line: Math.max(line, 1), source: KitSource.Gcsim },
      value,
    });
  };
  return {
    add,
    // A slot's frames are one set, or a list of them one for each of its states, a list of lists for a slot with a list of
    // States per level, the first state at each level being the press or the tap a slot is read by
    addFrames: (path, ...names) => {
      const constant = findGcsimConstant(constantMap, ...names);
      const isList = Array.isArray(constant?.value);
      const frames = readFirstGoFrames(constant?.value);
      if (
        constant !== undefined &&
        typeof frames === "object" &&
        frames !== null &&
        !Array.isArray(frames) &&
        !checkIsGoFloat(frames)
      )
        add(
          path,
          frames.animationFrames,
          toFile(constant.file),
          isList ? (constant.elementLines[0] ?? constant.line) : constant.line,
        );
    },
    // A hit's area from its hitbox, its multiplier from its talent parameter joined through the config's `talents` and
    // The talent file's labels, and the rest from its `AttackInfo` fields, its poise else from the poise variable's
    addHit: (
      path,
      {
        areaHitbox,
        attack,
        constellation,
        hitmark,
        multiplierKey = GcsimMultiplierKey.Multiplier,
        poiseDamage,
        talentLeaf,
      },
      targetingArea,
    ) => {
      if (hitmark !== undefined) add(`${path}.hitmarkFrames`, hitmark.value, toFile(hitmark.file), hitmark.line);
      if (areaHitbox !== undefined) {
        const area = toGcsimArea(areaHitbox, targetingArea);
        if (area !== undefined)
          add(`${path}.area`, area.area, toFile(areaHitbox.file ?? configFile), areaHitbox.line, area.cause);
      }
      let isLabelled = false;
      if (talentLeaf !== undefined) {
        const { type } = talentLeaf.reference;
        const parameter = readGcsimTalentParameter(talentParameterMap, talentLeaf.reference);
        if (parameter !== undefined) {
          isLabelled = true;
          add(
            `${path}.${multiplierKey}`,
            {
              index: parameter.index,
              proudSkillGroupId: talentGroupIdMap[GcsimTalentTypeCombatTalentMap[type]],
              ...(constellation !== undefined && { constellation }),
            },
            toFile(talentFile),
            parameter.line,
          );
        }
      }
      // A hit whose talent row names no parameter reads the array its attack's variable names, joined to its
      // Parameter by value
      const talentArrayJoin = isLabelled
        ? undefined
        : joinGcsimVariableTalentArray(talentArrayMap, attack?.talentVariable ?? "", {
            talentGroupIdMap,
            talentMultiplierMap,
          });
      if (talentArrayJoin !== undefined)
        add(
          `${path}.multiplier`,
          { ...talentArrayJoin.multiplier, ...(constellation !== undefined && { constellation }) },
          toFile(talentFile),
          talentArrayJoin.line,
        );
      if (attack === undefined) return;
      const fieldFile = toFile(attack.file);
      const fieldLine = (key: string) => attack.fieldLineMap[key] ?? attack.line;
      if (attack.element !== undefined) {
        const element = toGcsimElement(attack.element);
        add(`${path}.element`, element, fieldFile, fieldLine("Element"));
        // A hit of no element applies no gauge
        if (element === undefined) add(`${path}.gauge`, undefined, fieldFile, fieldLine("Element"));
        else if (attack.durability !== undefined)
          add(`${path}.gauge`, attack.durability / GCSIM_DURABILITY_PER_GAUGE, fieldFile, fieldLine("Durability"));
      }
      // A direct Lunar tag is the Lunar reaction the hit's damage is dealt as, from the tag's own line
      const lunarReactionType =
        attack.attackTag === undefined ? undefined : GcsimAttackTagLunarReactionTypeMap[attack.attackTag];
      if (lunarReactionType !== undefined)
        add(`${path}.lunarReactionType`, lunarReactionType, fieldFile, fieldLine("AttackTag"));
      // A literal with no tag or strike type has gcsim's zero values, no tag and the default strike
      add(
        `${path}.internalCooldownTag`,
        toGcsimInternalCooldownTag(attack.internalCooldownTag ?? GCSIM_NO_INTERNAL_COOLDOWN_TAG),
        fieldFile,
        fieldLine("ICDTag"),
      );
      if (attack.poiseDamage !== undefined)
        add(`${path}.poiseDamage`, attack.poiseDamage, fieldFile, fieldLine("PoiseDMG"));
      else if (poiseDamage !== undefined) add(`${path}.poiseDamage`, poiseDamage.value, fieldFile, poiseDamage.line);
    },
    addNoActionFileRule: (path, value) => {
      addKitCandidate(candidateMap, path, {
        provenance: { cause: KitProvisionalCause.NoActionFile, rule: KitRule.NoActionFile, source: KitSource.Rule },
        value,
      });
    },
    toFile,
  };
};
