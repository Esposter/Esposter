import type { KitModule } from "#src/models/genshinAssets/kits/module/KitModule";
import type { KitModuleBuild } from "#src/models/genshinAssets/kits/module/KitModuleBuild";
import type { KitModuleRecord } from "#src/models/genshinAssets/kits/module/KitModuleRecord";
import type { Element, KitHoldRecord, TalentMultiplierMap } from "genshin-world";

import { createKitRecordConverter } from "#src/services/genshinAssets/kits/module/createKitRecordConverter";
import { toKitModuleBags } from "#src/services/genshinAssets/kits/module/toKitModuleBags";
import { toKitStanceActionsRecord } from "#src/services/genshinAssets/kits/module/toKitStanceActionsRecord";
import { KitPlunge } from "genshin-world";
import { basename } from "node:path";

// A kit module's values as the record that would reproduce them: each slot's actions, and beside them the values its
// Behaviour reads by name. The kit is built twice, once from the character's own multipliers and once from encoded
// Ones, so a value equal to a table's parameter in both builds is known to read it, and any other keeps its number, as
// Does a value the encoded build has no twin for where a parameter sizes the kit, as a hold count
export const toModuleKitRecord = (
  { analysis, characterId }: KitModule,
  build: KitModuleBuild,
  encodedBuild: KitModuleBuild,
  element: Element | undefined,
  talentMultiplierMap: TalentMultiplierMap,
): KitModuleRecord => {
  const { kit } = build;
  const encodedKit = encodedBuild.kit;
  const converter = createKitRecordConverter(kit, characterId, element, talentMultiplierMap);
  const { toAction, toHit, toParameter } = converter;
  const toOptionalParameter = (value: number | undefined, encodedValue: number | undefined) =>
    value === undefined ? undefined : toParameter(value, encodedValue);
  const mainRecord = toKitStanceActionsRecord(converter, kit, encodedKit);
  const { bags, unreadSites } = toKitModuleBags(analysis, build, encodedBuild, converter, mainRecord);
  const skillCharges = toOptionalParameter(kit.elementalSkillCharges, encodedKit.elementalSkillCharges);
  const skillMaximumHeldSeconds = toOptionalParameter(
    kit.elementalSkillMaximumHeldSeconds,
    encodedKit.elementalSkillMaximumHeldSeconds,
  );
  return {
    record: {
      ...mainRecord,
      ...bags,
      burstCooldownSeconds: toParameter(kit.burstCooldownSeconds, encodedKit.burstCooldownSeconds),
      ...(Number.isFinite(kit.burstEnergyCost) && {
        burstEnergyCost: toParameter(kit.burstEnergyCost, encodedKit.burstEnergyCost),
      }),
      ...(kit.elementalBurstVariant && {
        burstVariant: toAction(kit.elementalBurstVariant.action, encodedKit.elementalBurstVariant?.action),
      }),
      ...(kit.moonsignBenediction && {
        moonsignBenediction: { lunarReactionTypes: kit.moonsignBenediction.lunarReactionTypes },
      }),
      plungeCollision: toHit(kit.plungeCollision, encodedKit.plungeCollision),
      plunges: {
        [KitPlunge.High]: toAction(kit.highPlunge, encodedKit.highPlunge),
        [KitPlunge.Low]: toAction(kit.lowPlunge, encodedKit.lowPlunge),
      },
      ...(kit.elementalSkillChain && {
        skillChain: {
          followUps: kit.elementalSkillChain.followUps.map((action, index) =>
            toAction(action, encodedKit.elementalSkillChain?.followUps[index]),
          ),
          windowSeconds: kit.elementalSkillChain.windowSeconds,
        },
      }),
      ...(skillCharges !== undefined && { skillCharges }),
      skillCooldownSeconds: toParameter(kit.skillCooldownSeconds, encodedKit.skillCooldownSeconds),
      skillHolds: (kit.elementalSkillHolds ?? []).map((hold, index) => {
        const encodedHold = encodedKit.elementalSkillHolds?.[index];
        const holdRecord: KitHoldRecord = {
          action: toAction(hold.action, encodedHold?.action),
          cooldownSeconds: toParameter(hold.cooldownSeconds, encodedHold?.cooldownSeconds),
          minimumHeldSeconds: hold.minimumHeldSeconds,
        };
        if (hold.variant) holdRecord.variant = toAction(hold.variant.action, encodedHold?.variant?.action);
        return holdRecord;
      }),
      ...(skillMaximumHeldSeconds !== undefined && { skillMaximumHeldSeconds }),
    },
    unreadSites: [
      ...build.failedSiteIds.map((siteId) => {
        const site = analysis.sites.find(({ id }) => id === siteId);
        return `${basename(analysis.file)}:${site?.line} ${site?.name} could not be read once the kit was built`;
      }),
      ...unreadSites,
    ],
  };
};
