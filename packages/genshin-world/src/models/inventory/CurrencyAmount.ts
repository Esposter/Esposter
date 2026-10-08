import type { Currency } from "#src/models/inventory/Currency";

// So much of one currency: a wish's cost, or what a wish returns
export interface CurrencyAmount {
  currency: Currency;
  quantity: number;
}
