import type { KitInput } from "#src/models/genshinAssets/kits/build/KitInput";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import {
  GCSIM_PLUNGE_FALLBACK_FOLDER,
  GCSIM_TAG,
  KIT_OVERLAY_DIRECTORY,
} from "#src/services/genshinAssets/kits/constants";
import { findGcsimFolder } from "#src/services/genshinAssets/kits/gcsim/findGcsimFolder";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { readGcsimMainCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimMainCharacters";
import { toGcsimFolderName } from "#src/services/genshinAssets/kits/gcsim/toGcsimFolderName";
import { compareKitRecord } from "#src/services/genshinAssets/kits/record/compareKitRecord";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { existsSync, rmSync } from "node:fs";
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

// Builds every kit module as it stands against its sources, seeds each character's overlay with what the build needs to
// Reproduce it, and returns the report: the overlay's entries by kit and by cause, the shared causes the rules applied,
// The values read past the licence line by kit, the characters the tag predates, and what failed by kit. gcsim's
// Current branch is read in memory only, to tell a value read past the licence line from one that differs
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
  for (const { gcsimFolder, moduleRecord, name, notes, overlayName, sourceCandidateMap, tables } of inputs) {
    const mainFolder = gcsimFolder ?? findGcsimFolder(mainCharacterMap, name);
    const mainCharacter = mainFolder === undefined ? undefined : mainCharacterMap.get(mainFolder);
    const mainCandidateMap: Map<string, KitCandidate[]> =
      mainCharacter === undefined || mainPlungeFallback === undefined
        ? new Map()
        : getGcsimKitCandidates(mainCharacter, tables, mainPlungeFallback);
    const isTagPredated = gcsimFolder === undefined;
    if (isTagPredated) predatedNames.push(name);
    const { built, failures, overlay } = compareKitRecord(
      moduleRecord,
      sourceCandidateMap,
      mainCandidateMap,
      isTagPredated,
    );
    const overlayPath = join(KIT_OVERLAY_DIRECTORY, `${overlayName}.json`);
    const entries = Object.entries(overlay);
    if (entries.length > 0) writeJsonFile(overlayPath, overlay);
    else if (existsSync(overlayPath)) rmSync(overlayPath);
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
    const kitFailures = [...notes, ...failures.map((failure) => `build: ${failure}`)];
    if (kitFailures.length > 0) failureLines.push(`  ${name}: ${kitFailures.join("; ")}`);
  }
  return [
    `kits --compare at gcsim ${GCSIM_TAG}: ${inputs.length} kits, ${overlayKeys.length} overlay entries`,
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
