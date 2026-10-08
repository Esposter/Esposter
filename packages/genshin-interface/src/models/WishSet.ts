// A wish ×1 or ×10 as its button offers it: how many wishes, the button's words, its cost as the Fate's name and count,
// And whether the wallet holds it
export interface WishSet {
  cost: string;
  count: number;
  isAffordable: boolean;
  label: string;
}
