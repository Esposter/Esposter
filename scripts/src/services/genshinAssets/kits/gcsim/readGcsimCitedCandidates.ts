import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { GCSIM_CHARACTERS_PATH } from "#src/services/genshinAssets/kits/constants";
import { readCitedArea } from "#src/services/genshinAssets/kits/gcsim/readCitedArea";
import { readCitedTargetingArea } from "#src/services/genshinAssets/kits/gcsim/readCitedTargetingArea";
import { readCitedValue } from "#src/services/genshinAssets/kits/gcsim/readCitedValue";
import { readConstructorIndex } from "#src/services/genshinAssets/kits/gcsim/readConstructorIndex";
import { readGcsimFieldIdentifier } from "#src/services/genshinAssets/kits/gcsim/readGcsimFieldIdentifier";
import { readNormalCounter } from "#src/services/genshinAssets/kits/gcsim/readNormalCounter";
import { toGcsimAttackTag } from "#src/services/genshinAssets/kits/gcsim/toGcsimAttackTag";
import { toGcsimElement } from "#src/services/genshinAssets/kits/gcsim/toGcsimElement";
import { toGcsimInternalCooldownTag } from "#src/services/genshinAssets/kits/gcsim/toGcsimInternalCooldownTag";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { Attribute } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NamedFieldCitation } from "#src/models/genshinAssets/kits/gcsim/NamedFieldCitation";

// A named field of a kit record, by its last key, with the gcsim field its citing line names and the kit value that
// Field's identifier gives, through the same mapping the writer maps a hit's values by
const NamedFieldCitationMap: Partial<Record<string, { field: string; toValue: (identifier: string) => unknown }>> = {
  [NamedFieldCitation.AttackTag]: { field: "AttackTag", toValue: toGcsimAttackTag },
  [NamedFieldCitation.Element]: { field: "Element", toValue: toGcsimElement },
  [NamedFieldCitation.InternalCooldownTag]: { field: "ICDTag", toValue: toGcsimInternalCooldownTag },
  [NamedFieldCitation.ScalingAttribute]: {
    field: "UseDef",
    toValue: (identifier) => (identifier === "true" ? Attribute.Defense : undefined),
  },
};

// The candidates of the overlay's cited values: each cited line of a gcsim character's folder gives a Gcsim candidate
// With that file and line, its value a number the line evaluates to that equals the cited value, or its first value
// Where none does, an area, or a named field's mapped value, so a citation the line does not give reads as a difference
export const readGcsimCitedCandidates = (
  overlay: KitOverlay,
  gcsimDirectory: string,
  gcsim: GcsimCharacter,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("file" in entry) || entry.value === undefined) continue;
    const file = `${GCSIM_CHARACTERS_PATH}/${gcsim.folder}/${entry.file}`;
    const source = readFileSync(join(gcsimDirectory, file), "utf8");
    const lines = source.split("\n");
    // An area is cited by the constructor on its line, whole, with the table cells it reads cited by their rows
    if (typeof entry.value === "object" && entry.value !== null && !Array.isArray(entry.value)) {
      const cited = readCitedArea(
        lines,
        readConstructorIndex(lines, entry.line - 1),
        file,
        readNormalCounter(path),
        readCitedTargetingArea(path, overlay, talentGroupIdMap),
      );
      if (cited !== undefined)
        addKitCandidate(candidateMap, path, {
          provenance: { file, line: cited.line, source: KitSource.Gcsim },
          value: cited.area,
        });
      continue;
    }
    const field = path.slice(path.lastIndexOf(".") + 1);
    const namedField = NamedFieldCitationMap[field];
    if (namedField !== undefined) {
      const identifier = readGcsimFieldIdentifier(lines[entry.line - 1] ?? "", namedField.field);
      const namedValue = identifier === undefined ? undefined : namedField.toValue(identifier);
      if (namedValue !== undefined)
        addKitCandidate(candidateMap, path, {
          provenance: { file, line: entry.line, source: KitSource.Gcsim },
          value: namedValue,
        });
      continue;
    }
    const value = readCitedValue(
      { fileName: entry.file, gcsim, lines, tokens: tokenizeGo(source) },
      entry.line - 1,
      entry.value,
      entry.index,
      path,
    );
    if (value === undefined) continue;
    addKitCandidate(candidateMap, path, { provenance: { file, line: entry.line, source: KitSource.Gcsim }, value });
  }
  return candidateMap;
};
