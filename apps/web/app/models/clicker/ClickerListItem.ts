// One row of the store or the inventory: which item, its picture, what it costs, and how many are owned. Whether it can
// Be paid for is left out where nothing buys it, as a bought upgrade's row
export interface ClickerListItem {
  amount?: number;
  id: string;
  image?: string;
  isAffordable?: boolean;
  price: number;
}
