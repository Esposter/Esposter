import type { KitModuleBuild } from "#src/models/genshinAssets/kits/module/KitModuleBuild";
import type { KitModuleSite } from "#src/models/genshinAssets/kits/module/KitModuleSite";
import type { KitRecordConverter } from "#src/models/genshinAssets/kits/module/KitRecordConverter";
import type { KitSiteEntries } from "#src/models/genshinAssets/kits/module/KitSiteEntries";
import type { KitAction, KitHit, KitStanceActions, KitStanceRecord } from "genshin-world";

import { KitBag } from "#src/models/genshinAssets/kits/module/KitBag";
import { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";
import { KitModuleSiteKind } from "#src/models/genshinAssets/kits/module/KitModuleSiteKind";
import { KitCaptureKindBagMap } from "#src/services/genshinAssets/kits/module/KitCaptureKindBagMap";
import { exhaustiveGuard } from "@esposter/shared";
import { isDeepStrictEqual } from "node:util";

const FRAMES_NAME_SUFFIX = "Frames";

// A site's values, one for each time its span was evaluated, as one value where every time read the same, as a list in
// The order they were read where they differ, and as each value it read where each is itself a list, which a record
// Holds under one name each
const toValues = (values: readonly unknown[]): unknown[] => {
  if (values.every((value) => isDeepStrictEqual(value, values[0]))) return values.slice(0, 1);
  else if (values.some((value) => Array.isArray(value))) return [...values];
  else return [values];
};

// Whether a value read from a table, which a converted number is where it is a parameter, is among a site's values
const checkHasParameter = (value: unknown): boolean =>
  Array.isArray(value) ? value.some((element) => checkHasParameter(element)) : typeof value === "object";

// Each site of a kit module as the values it gives its record by name, from its values in the build of the character's
// Own multipliers and in the build of encoded ones. A talent read and a value read from a table go in its parameters,
// A frame count in its frames, a hit, action, area or stance read whole in its hits, actions, areas or stances, and the
// Fields of a literal built as the kit plays in its hit or action fields; any other number is the behaviour's own
export const toKitSiteEntries = (
  sites: readonly KitModuleSite[],
  build: KitModuleBuild,
  encodedBuild: KitModuleBuild,
  { toAction, toActionFields, toArea, toFrames, toHit, toHitFields, toParameter }: KitRecordConverter,
  checkIsMainValue: (value: unknown) => boolean,
  toStance: (stance: KitStanceActions, encodedStance: KitStanceActions | undefined) => KitStanceRecord,
): Map<KitModuleSite, KitSiteEntries> => {
  const toNumberValue = (value: unknown, encodedValue: unknown): unknown => {
    if (typeof value === "number") return toParameter(value, encodedValue);
    else if (Array.isArray(value))
      return value.map((element, index) =>
        toNumberValue(element, Array.isArray(encodedValue) ? encodedValue[index] : undefined),
      );
    else return value;
  };
  const toCapture = (captureKind: KitCaptureKind, value: unknown, encodedValue: unknown): unknown => {
    if (Array.isArray(value))
      return value.map((element, index) =>
        toCapture(captureKind, element, Array.isArray(encodedValue) ? encodedValue[index] : undefined),
      );
    switch (captureKind) {
      case KitCaptureKind.Action:
        return toAction(value as KitAction, encodedValue as KitAction | undefined);
      case KitCaptureKind.Area:
        return toArea(value as KitHit["hitArea"]);
      case KitCaptureKind.Hit:
        return toHit(value as KitHit, encodedValue as KitHit | undefined);
      case KitCaptureKind.Stance:
        return toStance(value as KitStanceActions, encodedValue as KitStanceActions | undefined);
      default:
        return exhaustiveGuard(captureKind);
    }
  };
  const siteEntriesMap = new Map<KitModuleSite, KitSiteEntries>();
  const fieldSites: KitModuleSite[] = [];
  for (const site of sites) {
    const values = build.siteValueMap.get(site.id) ?? [];
    const encodedValues = encodedBuild.siteValueMap.get(site.id) ?? [];
    const toEntries = (bag: KitBag, readValues: readonly unknown[], isParameter = false): KitSiteEntries =>
      readValues.length === 0
        ? { entries: [], isParameter, unreadReason: "is never read as the kit is built" }
        : { entries: toValues(readValues).map((value) => ({ bag, name: site.name, value })), isParameter };
    switch (site.kind) {
      case KitModuleSiteKind.Capture: {
        if (site.captureKind === undefined) break;
        const captureKind = site.captureKind;
        const captures = values.map((value, index) => toCapture(captureKind, value, encodedValues[index]));
        siteEntriesMap.set(
          site,
          captures.length > 0 && captures.every((capture) => checkIsMainValue(capture))
            ? { entries: [], isParameter: false }
            : toEntries(KitCaptureKindBagMap[captureKind], captures),
        );
        break;
      }
      case KitModuleSiteKind.Field:
        fieldSites.push(site);
        break;
      case KitModuleSiteKind.Frames:
        siteEntriesMap.set(site, toEntries(KitBag.Frames, values));
        break;
      case KitModuleSiteKind.Talent:
        siteEntriesMap.set(
          site,
          site.parameters === undefined
            ? { entries: [], isParameter: true, unreadReason: "its talent's group or index is chosen as the kit plays" }
            : toEntries(KitBag.Parameters, [site.parameters.length === 1 ? site.parameters[0] : site.parameters], true),
        );
        break;
      case KitModuleSiteKind.Value: {
        const numberValues = values.map((value, index) => toNumberValue(value, encodedValues[index]));
        if (numberValues.some((value) => checkHasParameter(value)))
          siteEntriesMap.set(site, toEntries(KitBag.Parameters, numberValues, true));
        else if (site.isFramesAsSeconds)
          siteEntriesMap.set(
            site,
            toEntries(
              KitBag.Frames,
              values.map((value) => (typeof value === "number" ? toFrames(value) : value)),
            ),
          );
        else if (site.name.endsWith(FRAMES_NAME_SUFFIX)) siteEntriesMap.set(site, toEntries(KitBag.Frames, values));
        else siteEntriesMap.set(site, { entries: [], isParameter: false });
        break;
      }
      default:
        exhaustiveGuard(site.kind);
    }
  }
  const literalFieldSitesMap = Map.groupBy(fieldSites, ({ literalId }) => literalId);
  for (const literalFieldSites of literalFieldSitesMap.values()) {
    const [firstSite] = literalFieldSites;
    if (firstSite === undefined) continue;
    const readCount = build.siteValueMap.get(firstSite.id)?.length ?? 0;
    const toLiteral = (siteValueMap: KitModuleBuild["siteValueMap"], index: number) =>
      Object.fromEntries(
        literalFieldSites.map(({ fieldKey, id }) => [fieldKey, siteValueMap.get(id)?.[index]]),
      ) as Partial<KitAction & KitHit>;
    const literals = Array.from({ length: readCount }, (_value, index) =>
      firstSite.captureKind === KitCaptureKind.Action
        ? toActionFields(toLiteral(build.siteValueMap, index), toLiteral(encodedBuild.siteValueMap, index))
        : toHitFields(toLiteral(build.siteValueMap, index), toLiteral(encodedBuild.siteValueMap, index)),
    );
    const bag = firstSite.captureKind === KitCaptureKind.Action ? KitBag.ActionFields : KitBag.HitFields;
    siteEntriesMap.set(
      firstSite,
      literals.length > 0 && literals.every((literal) => isDeepStrictEqual(literal, literals[0]))
        ? { entries: [{ bag, name: firstSite.name, value: literals[0] }], isParameter: false }
        : { entries: [], isParameter: false, unreadReason: "its fields differ each time it is built" },
    );
  }
  return siteEntriesMap;
};
