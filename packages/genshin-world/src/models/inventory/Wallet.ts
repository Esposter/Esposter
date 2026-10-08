import type { Currency } from "#src/models/inventory/Currency";

// How much of each currency the player holds, and the moment their Original Resin last changed, from which its
// Regeneration is read, and the Primogem refills of Original Resin made on the game day `primogemResinRefillDay`
export interface Wallet extends Record<Currency, number> {
  originalResinChangedAt: Temporal.Instant;
  primogemResinRefillCount: number;
  primogemResinRefillDay: Temporal.PlainDate;
}
