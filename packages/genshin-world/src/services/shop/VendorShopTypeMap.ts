// Each city vendor's shop by the vendor's NPC id, as the resident's id names it, from the wiki's vendor pages, region by
// Region, Mondstadt first, then each Fishing Association's shop, matched to its member by the stock the wiki lists for them.
// The dump links no NPC to a shop, so each entry is provisional until a recording confirms it
export const VendorShopTypeMap: Partial<Record<string, number>> = {
  // Blanche, the Mondstadt general goods vendor, on the grocery's shop
  "1423": 1004,
  // Flora, Mondstadt, on the Flora shop
  "1425": 1011,
  // Marjorie, who runs With Wind Comes Glory as the Souvenir Shop that trades Anemo Sigils
  "1435": 1002,
  // Charles, Mondstadt, on the Charles shop
  "1465": 1012,
  // Draff, Mondstadt, on the Draff shop
  "1537": 1017,
  // Brook, Mondstadt, on the Brook shop
  "1541": 1015,
  // Schulz, Mondstadt, on the Schulz shop
  "1638": 1014,
  // Shiliu, Mondstadt, on the Shiliu shop
  "1640": 1013,
  // Chloris, Mondstadt, on the Chloris shop
  "1657": 1018,
  // Nantuck, Mondstadt's Fishing Association, on the Mondstadt fishing shop
  "1673": 1064,
  // Jiawei, Liyue's Fishing Association, on the Liyue fishing shop
  "2615": 1065,
  // Kujirai Momiji, Inazuma's Fishing Association, on the Inazuma fishing shop
  "3200": 1066,
  // Loumelat, Sumeru's Fishing Association, on the Sumeru fishing shop
  "4176": 1071,
  // Delaroche, Fontaine's Fishing Association, on the Fontaine fishing shop
  "5073": 1090,
  // Oroluk, Natlan's Fishing Association, on the Natlan fishing shop
  "6340": 1122,
  // Hedvika, Nod-Krai's Fishing Association, on the Nod-Krai fishing shop
  "7086": 1137,
  // Zherebtsov, Snezhnaya's Fishing Association, on the Snezhnaya fishing shop
  "7418": 1156,
};
