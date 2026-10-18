import { Currency } from "#src/models/inventory/Currency";
import { SIGIL_CURRENCIES } from "#src/services/inventory/constants";
import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The wallet as the save holds it: the counts by currency, and the instants and game days as their ISO strings, which
// Are read back into the wallet's Temporal values when the save loads
export const walletSaveSchema = z.object({
  // Every currency but the Sigils, which a save written before they were added does not hold, so it is read as zero
  currencies: z
    .partialRecord(z.enum(Currency), z.int().nonnegative())
    .refine(
      (currencies) =>
        Object.values(Currency).every((currency) => SIGIL_CURRENCIES.includes(currency) || currency in currencies),
      "A save holds every currency but the Sigils",
    ),
  originalResinChangedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  primogemResinRefillCount: z.int().nonnegative(),
  primogemResinRefillDay: z.iso.date(),
});

export type WalletSave = z.infer<typeof walletSaveSchema>;
