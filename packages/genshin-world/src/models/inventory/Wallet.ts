import type { Currency } from "#src/models/inventory/Currency";

// How much of each currency the player holds
export type Wallet = Record<Currency, number>;
