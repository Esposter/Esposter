import { RAW_OWNER_PATH_ID_OFFSET } from "#src/services/genshinAssets/ui/constants";

// The GameObject a raw export belongs to: each component's raw export opens with a pointer to its GameObject, whose 64-bit
// path ID is kept as the decimal text a JSON dump keeps it as
export const readRawOwnerPathId = (raw: Buffer): string => raw.readBigInt64LE(RAW_OWNER_PATH_ID_OFFSET).toString();
