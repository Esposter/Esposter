import type { Resident } from "#src/models/world/Resident";

import { VendorShopTypeMap } from "#src/services/shop/VendorShopTypeMap";

// The shop a talk's resident sells from, when the resident is a city vendor the map names, else undefined. The talk opens
// That shop in place of the dialogue
export const getTalkVendorShopId = (
  talkId: string,
  residents: readonly Resident[],
  vendorShopTypeMap: Partial<Record<string, number>> = VendorShopTypeMap,
): number | undefined => {
  const resident = residents.find((candidate) => candidate.talkId === talkId);
  return resident ? vendorShopTypeMap[resident.id] : undefined;
};
