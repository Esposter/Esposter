// A currency a screen shows the player's count of: its id, its name in the reader's language and the count
export interface CurrencyCount {
  id: string;
  // Whether the player can top it up, which the foot shows as a plus beside its count
  isTopUp?: true;
  name: string;
  quantity: number;
}
