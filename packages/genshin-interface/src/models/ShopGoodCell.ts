// One good a shop sells, as the Shop screen lists it: the game's id for it, its name and price in the reader's language,
// And the limit and refresh lines the game words for it, where the good has a limit and a refresh
export interface ShopGoodCell {
  id: number;
  // The Left This Month, Left Today or Left This Week line, its count already filled, where the good has a limit
  limitLabel?: string;
  name: string;
  // The price, as a count of the currency it is bought with
  price: number;
  // The currency's name, which the price's icon is labelled with
  priceName: string;
  // The Refreshes in line, its countdown already filled, where the good comes back on a refresh
  refreshLabel?: string;
}
