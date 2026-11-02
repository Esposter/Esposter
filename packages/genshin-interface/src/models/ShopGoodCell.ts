// One good a shop sells, as the Shop screen lists it: the game's id for it, its name and the costs it is bought with in the
// Reader's language, and the limit and refresh lines the game words for it, where the good has a limit and a refresh
export interface ShopGoodCell {
  // Each cost the good is bought with: how many of it, and the name of its currency or item, which its icon is labelled with
  costs: { count: number; name: string }[];
  id: number;
  // The Left This Month, Left Today or Left This Week line, its count already filled, where the good has a limit
  limitLabel: string;
  name: string;
  // The Refreshes in line, its countdown already filled, where the good comes back on a refresh
  refreshLabel: string;
  // The sold-out line the game words in place of the limit line, where the good can no longer be bought
  soldOutLabel?: string;
  // The frame the good is drawn in where it is not the plain one: the gold a Fate is drawn in
  tone?: "gold";
}
