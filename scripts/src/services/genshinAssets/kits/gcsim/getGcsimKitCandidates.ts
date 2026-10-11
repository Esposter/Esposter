import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { AttackArea } from "genshin-world";

import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import {
  GCSIM_AIM_CHARGE_LEVEL,
  GCSIM_BLUNT_STRIKE_TYPE,
  GCSIM_BURST_ATTACK_TAGS,
  GCSIM_CHARACTERS_PATH,
  GCSIM_CHARGED_ATTACK_TAG,
  GCSIM_CONFIG_FILE,
  GCSIM_DURABILITY_PER_GAUGE,
  GCSIM_NO_INTERNAL_COOLDOWN_TAG,
  GCSIM_PHYSICAL_ELEMENT,
  GCSIM_SKILL_ATTACK_TAGS,
  NO_ACTION_FILE_CLAYMORE_CHARGED_CANCEL_FRAMES,
  NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES,
  NO_ACTION_FILE_PLUNGE_CANCEL_FRAMES,
} from "#src/services/genshinAssets/kits/constants";
import { GcsimElementMap } from "#src/services/genshinAssets/kits/gcsim/GcsimElementMap";
import { GcsimInternalCooldownTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimInternalCooldownTagMap";
import { toGcsimArea } from "#src/services/genshinAssets/kits/gcsim/toGcsimArea";
import {
  CombatTalent,
  createCircleReach,
  KitPlunge,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  WeaponType,
} from "genshin-world";

const GcsimTalentTypeCombatTalentMap: Record<GcsimTalentType, CombatTalent> = {
  [GcsimTalentType.Attack]: CombatTalent.NormalAttack,
  [GcsimTalentType.Burst]: CombatTalent.ElementalBurst,
  [GcsimTalentType.Skill]: CombatTalent.ElementalSkill,
};

interface HitSource {
  areaHitbox?: GcsimHitbox;
  attack?: GcsimAttack;
  hitmark?: { file: string; line: number; value: number };
  // The poise the attack's poise variable gives this hit, by its place in its string
  poiseDamage?: { line: number; value: number };
  talentLeaf?: GcsimTalentLeaf;
}

const checkIsPathEqual = (left: readonly number[], right: readonly number[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const toNumbers = (value: GoValue | undefined): number[] | undefined => {
  if (typeof value === "number") return [value];
  return Array.isArray(value) && value.every((element) => typeof element === "number") ? value : undefined;
};

// Every value gcsim gives a character's kit at one ref, by its path in the record, read where gcsim's character folders
// Are regular: the normal attack's `attackHitmarks` and `attackFrames`, the charged attack's, plunges' and skill's and
// Burst's hitmark constants and frames, a projectile's hitmark as it lands after its travel, each hit's `AttackInfo`
// Fields and its talent parameter joined through the config's `talents` and the talent file's labels, and each hit's
// Area from the config's hitboxes by their names. A plunge with no file of its own, or a claymore's charged attack,
// Takes the shared rule: its frames are the ones the kits share, and a plunge borrows the fallback character's areas
export const getGcsimKitCandidates = (
  gcsim: GcsimCharacter,
  tables: KitTables,
  plungeFallback: GcsimCharacter,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const { attacks, config, constantMap, fileNames, folder, talentFile, talentParameterMap, travelMap } = gcsim;
  const toFile = (name: string, from = folder) => `${GCSIM_CHARACTERS_PATH}/${from}/${name}`;
  const add = (path: string, value: unknown, file: string, line: number, cause?: KitProvisionalCause) =>
    addKitCandidate(candidateMap, path, {
      provenance: { ...(cause && { cause }), file, line: Math.max(line, 1), source: KitSource.Gcsim },
      value,
    });
  const addNoActionFileRule = (path: string, value: number) =>
    addKitCandidate(candidateMap, path, {
      provenance: { cause: KitProvisionalCause.NoActionFile, rule: KitRule.NoActionFile, source: KitSource.Rule },
      value,
    });
  // A hitmark as its hit lands, after the travel of a projectile released at it
  const toLandingFrames = (hitmarkName: string, hitmark: number) => hitmark + (travelMap.get(hitmarkName)?.frames ?? 0);
  const readConstant = (...names: string[]) => {
    for (const name of names) {
      const constant = constantMap.get(name);
      if (constant !== undefined) return { ...constant, name };
    }
    return undefined;
  };
  const findHitboxes = (abilityName: string) => config.abilityHitboxesMap.get(abilityName) ?? [];
  const findHitbox = (abilityName: string, ...names: string[]) => {
    const hitboxes = findHitboxes(abilityName);
    for (const name of names) {
      const hitbox = hitboxes.find((candidate) => candidate.name === name);
      if (hitbox !== undefined) return hitbox;
    }
    return undefined;
  };
  const findTalentLeaf = (variable: string | undefined, path: readonly number[]) => {
    const talentVariable = config.talentVariables.find(({ name }) => name === variable);
    if (talentVariable === undefined) return undefined;
    const trimmedPath = [...path];
    for (;;) {
      const leaf = talentVariable.leaves.find((candidate) => checkIsPathEqual(candidate.path, trimmedPath));
      if (leaf !== undefined || trimmedPath.at(-1) !== 0) return leaf;
      trimmedPath.pop();
    }
  };
  const addFrames = (path: string, ...names: string[]) => {
    const constant = readConstant(...names);
    if (constant !== undefined && !Array.isArray(constant.value) && typeof constant.value === "object")
      add(path, constant.value.animationFrames, toFile(constant.file), constant.line);
  };
  const addHit = (
    path: string,
    { areaHitbox, attack, hitmark, poiseDamage, talentLeaf }: HitSource,
    targetingArea: AttackArea,
  ) => {
    if (hitmark !== undefined) add(`${path}.hitmarkFrames`, hitmark.value, toFile(hitmark.file), hitmark.line);
    if (areaHitbox !== undefined) {
      const area = toGcsimArea(areaHitbox, targetingArea);
      if (area !== undefined) add(`${path}.area`, area.area, toFile(GCSIM_CONFIG_FILE), areaHitbox.line, area.cause);
    }
    if (talentLeaf !== undefined) {
      const { label, selector, type } = talentLeaf.reference;
      const parameter = talentParameterMap.get(`${type}|${label}`);
      const index = parameter?.indexes[selector] ?? parameter?.indexes[0];
      if (parameter !== undefined && index !== undefined)
        add(
          `${path}.multiplier`,
          { index, proudSkillGroupId: tables.talentGroupIdMap[GcsimTalentTypeCombatTalentMap[type]] },
          toFile(talentFile),
          parameter.line,
        );
    }
    if (attack === undefined) return;
    const fieldFile = toFile(attack.file);
    const fieldLine = (key: string) => attack.fieldLineMap[key] ?? attack.line;
    if (attack.element !== undefined) {
      const isPhysical = attack.element === GCSIM_PHYSICAL_ELEMENT;
      add(
        `${path}.element`,
        isPhysical ? undefined : (GcsimElementMap[attack.element] ?? attack.element),
        fieldFile,
        fieldLine("Element"),
      );
      if (isPhysical) add(`${path}.gauge`, undefined, fieldFile, fieldLine("Element"));
      else if (attack.durability !== undefined)
        add(`${path}.gauge`, attack.durability / GCSIM_DURABILITY_PER_GAUGE, fieldFile, fieldLine("Durability"));
    }
    // A literal with no tag or strike type has gcsim's zero values, no tag and the default strike
    add(
      `${path}.internalCooldownTag`,
      attack.internalCooldownTag === undefined || attack.internalCooldownTag === GCSIM_NO_INTERNAL_COOLDOWN_TAG
        ? undefined
        : (GcsimInternalCooldownTagMap[attack.internalCooldownTag] ?? attack.internalCooldownTag),
      fieldFile,
      fieldLine("ICDTag"),
    );
    add(
      `${path}.isBlunt`,
      attack.strikeType === GCSIM_BLUNT_STRIKE_TYPE ? true : undefined,
      fieldFile,
      fieldLine("StrikeType"),
    );
    if (attack.poiseDamage !== undefined)
      add(`${path}.poiseDamage`, attack.poiseDamage, fieldFile, fieldLine("PoiseDMG"));
    else if (poiseDamage !== undefined) add(`${path}.poiseDamage`, poiseDamage.value, fieldFile, poiseDamage.line);
  };
  const findAttack = (variable: string | undefined) =>
    variable === undefined ? undefined : attacks.find(({ talentVariable }) => talentVariable === variable);
  // Normal attacks: each strike's hitmarks from `attackHitmarks`, its animation from `attackFrames`, and its hits'
  // Areas from the `N<strike>` or `N<strike>-<hit>` hitboxes
  const normalHitmarks = readConstant("attackHitmarks");
  if (normalHitmarks !== undefined && Array.isArray(normalHitmarks.value)) {
    const attack = findAttack("attack");
    const normalFrames = readConstant("attackFrames");
    const poiseVariable =
      attack?.poiseDamageVariable === undefined ? undefined : readConstant(attack.poiseDamageVariable);
    add("normalAttacks.length", normalHitmarks.value.length, toFile(normalHitmarks.file), normalHitmarks.line);
    for (const [strikeIndex, strikeHitmarks] of normalHitmarks.value.entries()) {
      const path = `normalAttacks.${strikeIndex}`;
      const hitmarks = toNumbers(strikeHitmarks) ?? [];
      const hitmarkLine = normalHitmarks.elementLines[strikeIndex] ?? normalHitmarks.line;
      add(`${path}.hits.length`, hitmarks.length, toFile(normalHitmarks.file), hitmarkLine);
      const strikeFrames = Array.isArray(normalFrames?.value) ? normalFrames.value[strikeIndex] : undefined;
      if (
        normalFrames !== undefined &&
        strikeFrames !== undefined &&
        !Array.isArray(strikeFrames) &&
        typeof strikeFrames === "object"
      )
        add(
          `${path}.cancelFrames`,
          strikeFrames.animationFrames,
          toFile(normalFrames.file),
          normalFrames.elementLines[strikeIndex] ?? normalFrames.line,
        );
      const strikePoise = Array.isArray(poiseVariable?.value) ? poiseVariable.value[strikeIndex] : undefined;
      for (const [hitIndex, hitmark] of hitmarks.entries()) {
        const hitPoise = Array.isArray(strikePoise) ? strikePoise[hitIndex] : strikePoise;
        addHit(
          `${path}.hits.${hitIndex}`,
          {
            areaHitbox: findHitbox("attack", `N${strikeIndex + 1}-${hitIndex + 1}`, `N${strikeIndex + 1}`),
            attack,
            hitmark: {
              file: normalHitmarks.file,
              line: hitmarkLine,
              value: toLandingFrames(normalHitmarks.name, hitmark),
            },
            ...(poiseVariable !== undefined &&
              typeof hitPoise === "number" && { poiseDamage: { line: poiseVariable.line, value: hitPoise } }),
            talentLeaf: findTalentLeaf("attack", [strikeIndex, hitIndex]),
          },
          STRIKE_TARGETING_AREA,
        );
      }
    }
  }
  // The charged attack: its hitmarks from `chargeHitmark` or `chargeHitmarks`, its frames from `chargeFrames`, and its
  // Hits' areas from the `CA` or `CA-<hit>` hitboxes. A bow's is its aimed shot at gcsim's default charge level, which
  // Drains no stamina, its hitmark and frames that level's in `aimedHitmarks` and `aimedFrames`, its area the `FullAim`
  // Hitbox and its multiplier `fullaim`'s
  const chargedAttack = attacks.find(({ attackTag }) => attackTag === GCSIM_CHARGED_ATTACK_TAG);
  const chargedHitmarks = readConstant("chargeHitmarks", "chargeHitmark");
  const chargedHitmarkValues = toNumbers(chargedHitmarks?.value);
  const aimedHitmarks = readConstant("aimedHitmarks");
  const aimedHitmark = toNumbers(aimedHitmarks?.value)?.[GCSIM_AIM_CHARGE_LEVEL];
  const aimedFrames = readConstant("aimedFrames");
  if (chargedHitmarks !== undefined && chargedHitmarkValues !== undefined) {
    add("chargedAttack.hits.length", chargedHitmarkValues.length, toFile(chargedHitmarks.file), chargedHitmarks.line);
    addFrames("chargedAttack.cancelFrames", "chargeFrames");
    for (const [hitIndex, hitmark] of chargedHitmarkValues.entries())
      addHit(
        `chargedAttack.hits.${hitIndex}`,
        {
          areaHitbox: findHitbox("charge", `CA-${hitIndex + 1}`, "CA"),
          attack: chargedAttack,
          hitmark: {
            file: chargedHitmarks.file,
            line: chargedHitmarks.line,
            value: toLandingFrames(chargedHitmarks.name, hitmark),
          },
          talentLeaf: findTalentLeaf(chargedAttack?.talentVariable, [hitIndex]),
        },
        STRIKE_TARGETING_AREA,
      );
  } else if (aimedHitmarks !== undefined && aimedHitmark !== undefined) {
    add("chargedAttack.hits.length", 1, toFile(aimedHitmarks.file), aimedHitmarks.line);
    add("chargedAttack.isAimed", true, toFile(aimedHitmarks.file), aimedHitmarks.line);
    add("chargedAttackStamina", 0, toFile(aimedHitmarks.file), aimedHitmarks.line);
    const aimedLevelFrames = Array.isArray(aimedFrames?.value) ? aimedFrames.value[GCSIM_AIM_CHARGE_LEVEL] : undefined;
    if (aimedFrames !== undefined && typeof aimedLevelFrames === "object" && !Array.isArray(aimedLevelFrames))
      add(
        "chargedAttack.cancelFrames",
        aimedLevelFrames.animationFrames,
        toFile(aimedFrames.file),
        aimedFrames.elementLines[GCSIM_AIM_CHARGE_LEVEL] ?? aimedFrames.line,
      );
    addHit(
      "chargedAttack.hits.0",
      {
        areaHitbox: findHitbox("aim", "FullAim"),
        attack: chargedAttack,
        hitmark: {
          file: aimedHitmarks.file,
          line: aimedHitmarks.line,
          value: toLandingFrames(aimedHitmarks.name, aimedHitmark),
        },
        talentLeaf: findTalentLeaf("fullaim", []),
      },
      STRIKE_TARGETING_AREA,
    );
  }
  if (readConstant("chargeFrames", "aimedFrames") === undefined && tables.weaponType === WeaponType.Claymore) {
    addNoActionFileRule("chargedAttack.hits.length", NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES.length);
    addNoActionFileRule("chargedAttack.cancelFrames", NO_ACTION_FILE_CLAYMORE_CHARGED_CANCEL_FRAMES);
    for (const [hitIndex, hitmark] of NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES.entries())
      addNoActionFileRule(`chargedAttack.hits.${hitIndex}.hitmarkFrames`, hitmark);
  }
  // The plunges: each landing's hitmark and frames from `lowPlungeHitmark` and `lowPlungeFrames` and their high twins,
  // Its area from the `Low_Plunge` or `High_Plunge` hitbox, and the collision's from `Plunge`. With no plunge file, the
  // Shared rule
  const hasPlungeFile = fileNames.includes("plunge.go");
  const plungeSource = hasPlungeFile ? gcsim : plungeFallback;
  const plungeCause = hasPlungeFile ? undefined : KitProvisionalCause.NoActionFile;
  for (const [plunge, prefix, hitboxName] of [
    [KitPlunge.Low, "low", "Low_Plunge"],
    [KitPlunge.High, "high", "High_Plunge"],
  ] as const) {
    const path = `plunges.${plunge}`;
    const hitbox = plungeSource.config.abilityHitboxesMap.get("plunge")?.find(({ name }) => name === hitboxName);
    if (hasPlungeFile) {
      const hitmark = readConstant(`${prefix}PlungeHitmark`);
      add(`${path}.hits.length`, 1, toFile("plunge.go"), hitmark?.line ?? 1);
      addFrames(`${path}.cancelFrames`, `${prefix}PlungeFrames`);
      const attack = findAttack(`${prefix}Plunge`);
      addHit(
        `${path}.hits.0`,
        {
          areaHitbox: hitbox,
          attack,
          ...(typeof hitmark?.value === "number" && {
            hitmark: { file: hitmark.file, line: hitmark.line, value: hitmark.value },
          }),
          talentLeaf: findTalentLeaf(`${prefix}Plunge`, []),
        },
        STRIKE_TARGETING_AREA,
      );
    } else {
      addNoActionFileRule(`${path}.hits.length`, 1);
      addNoActionFileRule(`${path}.cancelFrames`, NO_ACTION_FILE_PLUNGE_CANCEL_FRAMES);
      addNoActionFileRule(`${path}.hits.0.hitmarkFrames`, 0);
      if (hitbox?.radius !== undefined)
        add(
          `${path}.hits.0.area`,
          createCircleReach(0, hitbox.radius),
          toFile(GCSIM_CONFIG_FILE, plungeFallback.folder),
          hitbox.line,
          plungeCause,
        );
    }
  }
  const collisionHitbox = plungeSource.config.abilityHitboxesMap.get("plunge")?.find(({ name }) => name === "Plunge");
  if (hasPlungeFile)
    addHit(
      "plungeCollision",
      { areaHitbox: collisionHitbox, attack: findAttack("collision"), talentLeaf: findTalentLeaf("collision", []) },
      STRIKE_TARGETING_AREA,
    );
  else if (collisionHitbox?.radius !== undefined)
    add(
      "plungeCollision.area",
      createCircleReach(0, collisionHitbox.radius),
      toFile(GCSIM_CONFIG_FILE, plungeFallback.folder),
      collisionHitbox.line,
      plungeCause,
    );
  // The skill and burst: their hitmarks from `<slot>Hitmark` or `<slot>Hitmarks`, their frames from `<slot>Frames`, and
  // Each hit by its place among the slot's talent multipliers and the ability's hitboxes, where they are as many as its
  // Hitmarks
  for (const [slot, ability, attackTags] of [
    ["skill", "skill", GCSIM_SKILL_ATTACK_TAGS],
    ["burst", "burst", GCSIM_BURST_ATTACK_TAGS],
  ] as const) {
    addFrames(`${slot}.cancelFrames`, `${slot}Frames`, `${slot}PressFrames`);
    const hitmarks = readConstant(`${slot}Hitmarks`, `${slot}Hitmark`);
    const hitmarkValues = toNumbers(hitmarks?.value);
    if (hitmarks === undefined || hitmarkValues === undefined) continue;
    const slotAttacks = attacks.filter(({ attackTag }) => attackTag !== undefined && attackTags.includes(attackTag));
    const slotLeaves = [...new Set(slotAttacks.map(({ talentVariable }) => talentVariable))].flatMap(
      (variable) => config.talentVariables.find(({ name }) => name === variable)?.leaves ?? [],
    );
    // A hit is joined to a multiplier and a hitbox by its place only where the slot has one of each for every hitmark
    const isLeafJoined = slotLeaves.length === hitmarkValues.length;
    const hitboxes = findHitboxes(ability);
    const isHitboxJoined = hitboxes.length === hitmarkValues.length;
    add(`${slot}.hits.length`, hitmarkValues.length, toFile(hitmarks.file), hitmarks.line);
    for (const [hitIndex, hitmark] of hitmarkValues.entries()) {
      const talentLeaf = isLeafJoined ? slotLeaves[hitIndex] : undefined;
      const variable =
        talentLeaf === undefined
          ? undefined
          : config.talentVariables.find(({ leaves }) => leaves.includes(talentLeaf))?.name;
      addHit(
        `${slot}.hits.${hitIndex}`,
        {
          areaHitbox: isHitboxJoined ? hitboxes[hitIndex] : undefined,
          attack: slotAttacks.find(({ talentVariable }) => talentVariable === variable),
          hitmark: {
            file: hitmarks.file,
            line: hitmarks.elementLines[hitIndex] ?? hitmarks.line,
            value: toLandingFrames(hitmarks.name, hitmark),
          },
          talentLeaf,
        },
        SKILL_TARGETING_AREA,
      );
    }
  }
  return candidateMap;
};
