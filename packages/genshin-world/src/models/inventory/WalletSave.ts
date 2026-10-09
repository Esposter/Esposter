import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET_SAVE, MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The wallet as the save holds it: the counts by currency, and the instants and game days as their ISO strings, which
// Are read back into the wallet's Temporal values when the save loads
export const walletSaveSchema = z
  .object({
    currencies: z.record(z.enum(Currency), z.int().nonnegative()),
    originalResinChangedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
    primogemResinRefillCount: z.int().nonnegative(),
    primogemResinRefillDay: z.iso.date(),
  })
  .prefault(EMPTY_WALLET_SAVE);

export type WalletSave = z.infer<typeof walletSaveSchema>;
