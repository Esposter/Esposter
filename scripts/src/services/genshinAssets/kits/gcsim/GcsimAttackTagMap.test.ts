import { GCSIM_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { GcsimAttackTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimAttackTagMap";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("gcsimAttackTagMap", () => {
  const ATTACK_FILE = join(GCSIM_CACHE_DIRECTORY, "pkg/core/attacks/attack.go");
  // The tags gcsim declares that no kit attack tag names, each with its reason: the direct Lunar tags are the Lunar
  // Reaction type map's, the sentinels are no tag at all, and the rest are a character's own or a reaction's damage
  const UNMAPPED_TAG_NAMES: readonly string[] = [
    "AttackTagNone",
    "AttackTagNoneStat",
    "AttackTagRelicSkill",
    "AttackTagWeaponSkill",
    "AttackTagMonaBubbleBreak",
    "AttackTagNightsoul",
    "AttackTagKinichCannon",
    "AttackTagVarkaSpecial",
    "AttackTagOverloadDamage",
    "AttackTagSuperconductDamage",
    "AttackTagECDamage",
    "AttackTagShatter",
    "AttackTagSwirlPyro",
    "AttackTagSwirlHydro",
    "AttackTagSwirlCryo",
    "AttackTagSwirlElectro",
    "AttackTagBurningDamage",
    "AttackTagBloom",
    "AttackTagBountifulCore",
    "AttackTagBurgeon",
    "AttackTagHyperbloom",
    "AttackTagReactionLunarCharge",
    "AttackTagReactionLunarCrystallize",
    "AttackTagDirectLunarCharged",
    "AttackTagDirectLunarBloom",
    "AttackTagDirectLunarCrystallize",
    "AttackTagReactionStellarSwirl",
    "AttackTagDirectStellarConduct",
    "AttackTagDirectStellarSwirl",
  ];

  test.skipIf(!existsSync(ATTACK_FILE))(
    "names every attack tag gcsim declares, but the unmapped ones, with a map entry",
    () => {
      expect.hasAssertions();

      const gcsimTags = Array.from(
        readFileSync(ATTACK_FILE, "utf8").matchAll(/^\s*(?<name>AttackTag[A-Za-z0-9]+)\b/gmu),
        (match) => match.groups?.name,
      ).filter((name): name is string => name !== undefined);

      expect(gcsimTags.length).toBeGreaterThan(0);
      const unmappedTags = gcsimTags.filter(
        (name) => !(`attacks.${name}` in GcsimAttackTagMap) && !UNMAPPED_TAG_NAMES.includes(name),
      );
      expect(unmappedTags).toStrictEqual([]);
      expect(UNMAPPED_TAG_NAMES.filter((name) => `attacks.${name}` in GcsimAttackTagMap)).toStrictEqual([]);
    },
  );
});
