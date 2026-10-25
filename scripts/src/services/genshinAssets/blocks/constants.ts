import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";

// The code an extraction's outputs depend on, whose commits the stamp beside them lists against: the extraction's own
// Steps, the open world's, and the shared readers, component map and models both of them run on
export const EXTRACT_PRODUCER_PATHS: string[] = [
  "scripts/src/models/genshinAssets/shared",
  "scripts/src/models/genshinAssets/world",
  "scripts/src/services/genshinAssets/blocks",
  "scripts/src/services/genshinAssets/shared",
  "scripts/src/services/genshinAssets/world",
];

export const GROUP_BY_TYPE: string[] = ["--group_assets", AnimeStudioGroupType.ByType];

export const SOURCE_PREFIX = '"Source": "';
