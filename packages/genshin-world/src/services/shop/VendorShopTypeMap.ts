// Each city vendor's shop by the vendor's NPC id, as the resident's id names it, from the wiki's vendor pages, region by
// Region, Mondstadt first. The dump links no NPC to a shop, so each entry is provisional until a recording confirms it
export const VendorShopTypeMap: Partial<Record<string, number>> = {
  // Blanche, the Mondstadt general goods vendor, on the grocery's shop
  "1423": 1004,
  // Marjorie, who runs With Wind Comes Glory as the Souvenir Shop that trades Anemo Sigils
  "1435": 1002,
};
