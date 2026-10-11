import type { KitModuleAnalysis } from "#src/models/genshinAssets/kits/module/KitModuleAnalysis";
import type { KitModuleBags } from "#src/models/genshinAssets/kits/module/KitModuleBags";
import type { KitModuleBuild } from "#src/models/genshinAssets/kits/module/KitModuleBuild";
import type { KitRecordConverter } from "#src/models/genshinAssets/kits/module/KitRecordConverter";
import type { KitStanceActions, KitStanceRecord } from "genshin-world";

import { KitBag } from "#src/models/genshinAssets/kits/module/KitBag";
import { KIT_CREATE_PREFIX_REGEX } from "#src/services/genshinAssets/kits/constants";
import { toKitSiteEntries } from "#src/services/genshinAssets/kits/module/toKitSiteEntries";
import { toKitStanceActionsRecord } from "#src/services/genshinAssets/kits/module/toKitStanceActionsRecord";
import { uncapitalize } from "@esposter/shared";
import { basename } from "node:path";
import { isDeepStrictEqual } from "node:util";

// The words a name of each field's values ends in that the field already says
const KitBagNameSuffixesMap = {
  [KitBag.ActionFields]: ["Action"],
  [KitBag.Actions]: ["Actions", "Action"],
  [KitBag.Areas]: ["HitArea", "Area", "Reach"],
  [KitBag.Frames]: ["Frames", "Seconds"],
  [KitBag.HitFields]: ["Hits", "Hit"],
  [KitBag.Hits]: ["Hits", "Hit"],
  [KitBag.Parameters]: [],
  [KitBag.Stances]: ["Actions", "Stance"],
} as const satisfies Record<KitBag, readonly string[]>;

const toBagName = (bag: KitBag, name: string): string => {
  const baseName = uncapitalize(name.replace(KIT_CREATE_PREFIX_REGEX, ""));
  const suffix = KitBagNameSuffixesMap[bag].find(
    (bagSuffix: string) => baseName.endsWith(bagSuffix) && baseName.length > bagSuffix.length,
  );
  return suffix === undefined ? baseName : baseName.slice(0, -suffix.length);
};

// The values a kit module's behaviour reads that its record holds by name, beside the actions and hits its slots hold:
// Each site's, where a binding derived from talent reads or frame counts is a table's parameter its own value and
// Otherwise the reads it is derived from, each under its name less the words its field already says. Two values under
// One name are one where they are equal, and numbered from the second where they are not
export const toKitModuleBags = (
  analysis: KitModuleAnalysis,
  build: KitModuleBuild,
  encodedBuild: KitModuleBuild,
  converter: KitRecordConverter,
  mainRecord: Required<KitStanceRecord>,
): KitModuleBags => {
  const mainActions = [mainRecord.burst, mainRecord.chargedAttack, ...mainRecord.normalAttacks, mainRecord.skill];
  const mainValues = [mainRecord.normalAttacks, ...mainActions, ...mainActions.map(({ hits }) => hits)];
  // A stance's actions, less those it plays as its kit does
  const toStance = (stance: KitStanceActions, encodedStance: KitStanceActions | undefined): KitStanceRecord => {
    const { burst, chargedAttack, chargedAttackStamina, normalAttacks, skill } = toKitStanceActionsRecord(
      converter,
      stance,
      encodedStance,
    );
    return {
      ...(!isDeepStrictEqual(burst, mainRecord.burst) && { burst }),
      ...(!isDeepStrictEqual(chargedAttack, mainRecord.chargedAttack) && { chargedAttack }),
      ...(!isDeepStrictEqual(chargedAttackStamina, mainRecord.chargedAttackStamina) && { chargedAttackStamina }),
      ...(!isDeepStrictEqual(normalAttacks, mainRecord.normalAttacks) && { normalAttacks }),
      ...(!isDeepStrictEqual(skill, mainRecord.skill) && { skill }),
    };
  };
  const siteEntriesMap = toKitSiteEntries(
    analysis.sites,
    build,
    encodedBuild,
    converter,
    (value) => mainValues.some((mainValue) => isDeepStrictEqual(value, mainValue)),
    toStance,
  );
  const siteIdEntriesMap = new Map(Array.from(siteEntriesMap, ([site, siteEntries]) => [site.id, siteEntries]));
  const bags: Partial<Record<KitBag, Record<string, unknown>>> = {};
  const unreadSites: string[] = [];
  for (const [site, { entries, isParameter, unreadReason }] of siteEntriesMap) {
    const derivedSiteEntries = site.derivedSiteId === undefined ? undefined : siteIdEntriesMap.get(site.derivedSiteId);
    const derivingSites = analysis.sites.filter(({ derivedSiteId }) => derivedSiteId === site.id);
    if (derivedSiteEntries?.isParameter || (!isParameter && derivingSites.length > 0)) continue;
    else if (unreadReason !== undefined) {
      unreadSites.push(`${basename(analysis.file)}:${site.line} ${site.name} ${unreadReason}`);
      continue;
    }
    for (const { bag, name, value } of entries) {
      const bagValueMap = (bags[bag] ??= {});
      const baseName = toBagName(bag, name);
      for (let count = 1; ; count++) {
        const bagName = count === 1 ? baseName : `${baseName}${count}`;
        if (!(bagName in bagValueMap)) bagValueMap[bagName] = value;
        else if (!isDeepStrictEqual(bagValueMap[bagName], value)) continue;
        break;
      }
    }
  }
  return { bags: bags as KitModuleBags["bags"], unreadSites };
};
