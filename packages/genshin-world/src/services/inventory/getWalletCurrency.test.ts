import { Currency } from "#src/models/inventory/Currency";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { describe, expect, test } from "vitest";

describe(getWalletCurrency, () => {
  const REALM_CURRENCY_ITEM_ID = 204;

  test("realm Currency is held in the wallet", () => {
    expect.hasAssertions();

    expect(getWalletCurrency(REALM_CURRENCY_ITEM_ID)).toBe(Currency.RealmCurrency);
  });
});
