import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import {
  buildKitRecordWithDonors,
  readDonorRecordMap,
} from "#src/services/genshinAssets/kits/buildKitRecordWithDonors";
import {
  GCSIM_PLUNGE_FALLBACK_FOLDER,
  GCSIM_TAG,
  KIT_OVERLAY_DIRECTORY,
} from "#src/services/genshinAssets/kits/constants";
import { findGcsimFolder } from "#src/services/genshinAssets/kits/gcsim/findGcsimFolder";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { readGcsimMainCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimMainCharacters";
import { toGcsimFolderName } from "#src/services/genshinAssets/kits/gcsim/toGcsimFolderName";
import { getKitBagPaths } from "#src/services/genshinAssets/kits/getKitBagPaths";
import { readKitOverlayFile } from "#src/services/genshinAssets/kits/readKitOverlay";
import { compareKitRecord } from "#src/services/genshinAssets/kits/record/compareKitRecord";
import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { seedKitOverlay } from "#src/services/genshinAssets/kits/record/seedKitOverlay";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { getResult } from "@esposter/shared";
import { join } from "node:path";

const countBy = (keys: readonly string[]): Map<string, number> => {
  const countMap = new Map<string, number>();
  for (const key of keys) countMap.set(key, (countMap.get(key) ?? 0) + 1);
  return countMap;
};

const formatCounts = (countMap: ReadonlyMap<string, number>): string =>
  [...countMap]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => `${key} ${count}`)
    .join(", ") || "none";

// Builds every kit's published record against its sources, seeds each character's overlay with what the build needs to
// Reproduce it, and returns the report: the gap, each value the committed overlay left the build short of, by kit; the
// Overlay's entries by kit and by cause; the shared causes the rules applied; the values read past the licence line by
// Kit; the characters the tag predates; and what failed by kit. gcsim's current branch is read in memory only, to tell
// A value read past the licence line from one that differs
export const compareKits = async (inputs: readonly KitInput[]): Promise<string[]> => {
  const mainCharacterMap = await readGcsimMainCharacters([
    ...new Set([
      GCSIM_PLUNGE_FALLBACK_FOLDER,
      ...inputs.map(({ gcsimFolder, name }) => gcsimFolder ?? toGcsimFolderName(name)),
    ]),
  ]);
  const mainPlungeFallback = mainCharacterMap.get(GCSIM_PLUNGE_FALLBACK_FOLDER);
  const kitLines: string[] = [];
  const readPastLicenceLines: string[] = [];
  const failureLines: string[] = [];
  const predatedNames: string[] = [];
  const overlayKeys: string[] = [];
  const ruleCauses: string[] = [];
  const gapLines: string[] = [];
  let gapCount = 0;
  const inputMap = new Map(inputs.map((input): [number, KitInput] => [input.characterId, input]));
  const builtMap = new Map<number, BuiltKit>();
  for (const {
    characterId,
    gcsimFolder,
    name,
    namedHitCandidateMap,
    notes,
    overlay: committedOverlay,
    overlayName,
    publishedRecord,
    sourceCandidateMap,
    tables,
  } of inputs) {
    // A kit yet to be published has no record for its overlay to reproduce, so its first publish seeds nothing
    if (publishedRecord === undefined) {
      failureLines.push(`  ${name}: has no published kit to compare`);
      continue;
    }
    // A borrowed value is seeded from its donor's record, so a kit whose donor fails to build is reported, not seeded
    const donorRecordResult = getResult(() => readDonorRecordMap(characterId, committedOverlay, inputMap, builtMap));
    if (donorRecordResult.isErr()) {
      failureLines.push(
        `  ${name}: a donor of its committed overlay fails to build: ${donorRecordResult.error.message.split("\n")[0]}`,
      );
      continue;
    }
    const donorRecordMap = donorRecordResult.value;
    const { gapPaths, overlayFailures } = getResult(() =>
      buildKitRecordWithDonors(characterId, inputMap, builtMap),
    ).match(
      ({ record }) => ({
        gapPaths: getMismatchedKitPaths(record, publishedRecord, tables.talentMultiplierMap),
        overlayFailures: [] as string[],
      }),
      (error) => ({
        gapPaths: [] as string[],
        overlayFailures: [`the committed overlay fails to build: ${error.message.split("\n")[0]}`],
      }),
    );
    gapCount += gapPaths.length;
    if (gapPaths.length > 0) gapLines.push(`  ${name} (${gapPaths.length})`);
    const mainFolder = gcsimFolder ?? findGcsimFolder(mainCharacterMap, name);
    const mainCharacter = mainFolder === undefined ? undefined : mainCharacterMap.get(mainFolder);
    const mainCandidateMap: Map<string, KitCandidate[]> =
      mainCharacter === undefined || mainPlungeFallback === undefined
        ? new Map()
        : getGcsimKitCandidates(
            mainCharacter,
            tables,
            mainPlungeFallback,
            getKitBagPaths(publishedRecord, committedOverlay),
          );
    const isTagPredated = gcsimFolder === undefined;
    if (isTagPredated) predatedNames.push(name);
    const { built, failures, overlay } = compareKitRecord(
      publishedRecord,
      sourceCandidateMap,
      mainCandidateMap,
      isTagPredated,
      committedOverlay,
      donorRecordMap,
      namedHitCandidateMap,
      tables,
    );
    const overlayPath = join(KIT_OVERLAY_DIRECTORY, `${overlayName}.json`);
    const entries = Object.entries(overlay);
    // Written even when empty, as `{}`, so every kit keeps its file and its design's citation still resolves. A committed
    // File that fails to read is left as it is, since the overlay was rebuilt from nothing and would drop its entries
    getResult(() => readKitOverlayFile(overlayName)).match(
      (committedFile) => writeJsonFile(overlayPath, seedKitOverlay(committedFile, overlay)),
      () => undefined,
    );
    const kitKeys = entries.map(([, entry]) => ("source" in entry ? `chose ${entry.source}` : entry.cause));
    overlayKeys.push(...kitKeys);
    const kitRuleCauses = Object.values(built?.sources.values ?? {}).flatMap((provenance) =>
      provenance.source !== KitSource.Overlay && "cause" in provenance && provenance.cause !== undefined
        ? [provenance.cause]
        : [],
    );
    ruleCauses.push(...kitRuleCauses);
    kitLines.push(`  ${name}: ${formatCounts(countBy(kitKeys))} | rules: ${formatCounts(countBy(kitRuleCauses))}`);
    const readPastLicencePaths = entries.flatMap(([path, entry]) =>
      "cause" in entry && entry.cause === KitProvisionalCause.ReadPastLicence ? [path] : [],
    );
    if (readPastLicencePaths.length > 0)
      readPastLicenceLines.push(`  ${name} (${readPastLicencePaths.length}): ${readPastLicencePaths.join(", ")}`);
    const kitFailures = [...notes, ...overlayFailures, ...failures.map((failure) => `build: ${failure}`)];
    if (kitFailures.length > 0) failureLines.push(`  ${name}: ${kitFailures.join("; ")}`);
  }
  return [
    `kits --compare at gcsim ${GCSIM_TAG}: ${inputs.length} kits, ${overlayKeys.length} overlay entries`,
    `Gap against the committed overlays: ${gapCount} values in ${gapLines.length} kits`,
    ...gapLines,
    `Overlay entries by cause: ${formatCounts(countBy(overlayKeys))}`,
    `Shared causes applied by rule: ${formatCounts(countBy(ruleCauses))}`,
    "Per kit:",
    ...kitLines,
    `ReadPastLicence by kit: ${readPastLicenceLines.length === 0 ? "none" : ""}`,
    ...readPastLicenceLines,
    `Predated by the tag: ${predatedNames.join(", ") || "none"}`,
    `Failures by kit: ${failureLines.length === 0 ? "none" : ""}`,
    ...failureLines,
  ];
};
