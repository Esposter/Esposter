// The Fate a wish's banner spends, offered for Primogems once the wallet holds too few Fates for a wish: its cost as the
// Primogems' name and count, its button's words, and whether the wallet holds the Primogems for it
export interface WishPurchase {
  cost: string;
  isAffordable: boolean;
  label: string;
}
