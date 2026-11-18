import type { Resident } from "#src/models/world/Resident";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { getTalkScreenKind } from "#src/services/dialogue/getTalkScreenKind";
import { getTalkVendorShopId } from "#src/services/dialogue/getTalkVendorShopId";
import { describe, expect, test } from "vitest";

describe(getTalkScreenKind, () => {
  const TALK_ID = "talkId";
  const KEEPER: Resident = {
    areaId: "areaId",
    id: "id",
    keepsReputation: true,
    nameTextId: "nameTextId",
    talkId: TALK_ID,
  };

  test("talking to Mondstadt's keeper opens its Reputation screen", () => {
    expect.hasAssertions();

    expect(getTalkScreenKind(TALK_ID, [KEEPER])).toStrictEqual(ScreenKind.Reputation);
  });

  test("the Reputation screen is not reached before the keeper stands", () => {
    expect.hasAssertions();

    expect(getTalkScreenKind(TALK_ID, [])).toStrictEqual(ScreenKind.Dialogue);
  });

  test("talking to a vendor opens their shop", () => {
    expect.hasAssertions();
    const VENDOR: Resident = { areaId: "areaId", id: "vendorId", nameTextId: "nameTextId", talkId: "vendorTalkId" };
    expect(getTalkScreenKind("vendorTalkId", [VENDOR], { vendorId: 1 })).toBe(ScreenKind.Shop);
  });

  // Each Fishing Association member placed in the world, by his NPC id and the shop his association sells from. Zherebtsov
  // Is not placed, since Snezhnaya has no fitted region yet, so his association's shop does not open
  test.each([
    ["1673", 1064],
    ["2615", 1065],
    ["3200", 1066],
    ["4176", 1071],
    ["5073", 1090],
    ["6340", 1122],
    ["7086", 1137],
  ])("talking to the Fishing Association member %s opens shop %i", (id, shopId) => {
    expect.hasAssertions();
    const member: Resident = { areaId: "areaId", id, nameTextId: "nameTextId", talkId: "fishingTalkId" };
    expect(getTalkScreenKind("fishingTalkId", [member])).toBe(ScreenKind.Shop);
    expect(getTalkVendorShopId("fishingTalkId", [member])).toBe(shopId);
  });
});
