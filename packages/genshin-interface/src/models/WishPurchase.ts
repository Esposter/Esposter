// The Fate a wish's banner spends, offered for Primogems once the wallet holds too few Fates for a wish.
// Its cost is the Primogems' name and count, and its button's words are the game's.
// It is affordable when the wallet holds the Primogems for it.
export interface WishPurchase {
  cost: string;
  isAffordable: boolean;
  label: string;
}
