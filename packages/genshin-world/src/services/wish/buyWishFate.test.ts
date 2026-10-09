import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { buyWishFate } from "#src/services/wish/buyWishFate";
import { FATE_PRIMOGEM_COST } from "#src/services/wish/constants";
import { describe, expect, test } from "vitest";

describe(buyWishFate, () => {
  const wallet = { [Currency.IntertwinedFate]: 0, [Currency.Primogem]: FATE_PRIMOGEM_COST } as Wallet;

  test("takes the Primogems a Fate costs and adds the Fate", () => {
    expect.hasAssertions();

    expect(buyWishFate(wallet, Currency.IntertwinedFate)).toStrictEqual({
      ...wallet,
      [Currency.IntertwinedFate]: 1,
      [Currency.Primogem]: 0,
    });
  });

  test("refuses a purchase the Primogems do not cover", () => {
    expect.hasAssertions();

    expect(() =>
      buyWishFate({ ...wallet, [Currency.Primogem]: FATE_PRIMOGEM_COST - 1 }, Currency.IntertwinedFate),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: buyWishFate, IntertwinedFate]`,
    );
  });
});
