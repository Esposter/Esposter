import type { TalentLevelMap } from "#src/models/character/TalentLevelMap";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { applyKitBehaviour } from "#src/services/kit/build/applyKitBehaviour";
import { createKitRecordReader } from "#src/services/kit/build/createKitRecordReader";
import { createKitRecordResolver } from "#src/services/kit/build/createKitRecordResolver";
import { tagKitHits } from "#src/services/kit/tagKitHits";

// A character's kit, from its record and its behaviour, once as the character joins: the record's slots resolved against
// The character's multipliers and the level each talent plays at, its frames divided into seconds once and its talents'
// Parameters read off their tables at those levels, the behaviour given the record to read what else it plays by name,
// And what it returns joined to the slots' actions and hits, each tagged with the kind of attack its action deals
export const buildKit = (
  record: KitRecord,
  talentMultiplierMap: TalentMultiplierMap,
  talentLevelMap: TalentLevelMap,
  createBehaviour: (reader: KitRecordReader) => KitBehaviour,
): Kit => {
  const resolver = createKitRecordResolver(talentMultiplierMap, talentLevelMap);
  const kit = resolver.toKit(record);
  return tagKitHits(applyKitBehaviour(kit, createBehaviour(createKitRecordReader(record, resolver, kit))));
};
