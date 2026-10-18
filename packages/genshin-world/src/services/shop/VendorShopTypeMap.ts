// Each city vendor's shop by the vendor's NPC id, as the resident's id names it, from the wiki's vendor pages, region by
// Region, Mondstadt first. The dump links no NPC to a shop, so each entry is provisional until a recording confirms it
export const VendorShopTypeMap: Partial<Record<string, number>> = {
  // Blanche, the Mondstadt general goods vendor, on the grocery's shop
  "1423": 1004,
  // Marjorie, who runs With Wind Comes Glory as the Souvenir Shop that trades Anemo Sigils
  "1435": 1002,
  // Flora, Mondstadt, on the Flora shop
  "1425": 1011,
  // Charles, Mondstadt, on the Charles shop
  "1465": 1012,
  // Shiliu, Mondstadt, on the Shiliu shop
  "1640": 1013,
  // Schulz, Mondstadt, on the Schulz shop
  "1638": 1014,
  // Brook, Mondstadt, on the Brook shop
  "1541": 1015,
  // Draff, Mondstadt, on the Draff shop
  "1537": 1017,
  // Chloris, Mondstadt, on the Chloris shop
  "1657": 1018,
};
