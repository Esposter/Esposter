// One shop of the game's shop table: its id, the kind of shop it is, the city it stands in, and the Reputation level the
// City's discount starts at, zero where the shop gives none
export interface ExcelShopRow {
  cityDiscountLevel: number;
  cityId: number;
  shopId: number;
  shopType: string;
}
