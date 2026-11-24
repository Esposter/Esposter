// One good a shop sells, as the Shop screen lists it: the game's id for it and its name in the reader's language.
// Its limit and refresh lines are the game's words for it, where the good has a limit and a refresh.
export interface ShopGoodCell {
  // Each cost the good is bought with: how many of it, and the name of its currency or item.
  // The item's icon is labelled with that name.
  costs: { count: number; name: string }[];
  id: number;
  // The Left This Month, Left Today or Left This Week line, its count already filled, where the good has a limit
  limitLabel: string;
  name: string;
  // The Owned line, the count the player holds of the good's item already filled
  ownedLabel: string;
  // The Purchase up to line, its count left over the limit already filled, where the good has a buy limit
  purchaseLabel: string;
  // The Refreshes in line, its countdown already filled, where the good comes back on a refresh
  refreshLabel: string;
  // The sold-out line the game words in place of the limit line, where the good can no longer be bought
  soldOutLabel?: string;
  // The frame the good is drawn in where it is not the plain one: the gold a Fate is drawn in
  tone?: "gold";
}
