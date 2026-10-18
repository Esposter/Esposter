import { addQuickSwapGadget } from "#src/services/gadget/addQuickSwapGadget";
import { QUICK_SWAP_GADGET_LIMIT } from "#src/services/gadget/constants";
import { describe, expect, test } from "vitest";

describe(addQuickSwapGadget, () => {
  const CHOSEN_GADGET_ID = 1005;

  const QUICK_SWAP_GADGET_IDS = [1001, 1002, 1003, 1004];

  test("a gadget chosen joins the quick swap while it holds fewer than four", () => {
    expect.hasAssertions();

    expect(
      addQuickSwapGadget(QUICK_SWAP_GADGET_IDS.slice(0, QUICK_SWAP_GADGET_LIMIT - 1), CHOSEN_GADGET_ID),
    ).toStrictEqual([1001, 1002, 1003, CHOSEN_GADGET_ID]);
  });

  test("the quick swap does not hold a fifth gadget", () => {
    expect.hasAssertions();

    expect(addQuickSwapGadget(QUICK_SWAP_GADGET_IDS, CHOSEN_GADGET_ID)).toStrictEqual(QUICK_SWAP_GADGET_IDS);
  });
});
