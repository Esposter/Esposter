<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Currency } from "#src/models/inventory/Currency";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { PaimonsBargainsGood, PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { CurrencyCount, ShopGoodCell, ShopTabCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { useShopGoodCells } from "#src/composables/useShopGoodCells";
import { useShopPick } from "#src/composables/useShopPick";
import { ShopOfferKind } from "#src/models/shop/ShopOfferKind";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { buyPaimonsBargainsCharacter } from "#src/services/shop/buyPaimonsBargainsCharacter";
import { buyPaimonsBargainsWeapon } from "#src/services/shop/buyPaimonsBargainsWeapon";
import { buyShopGoodCount } from "#src/services/shop/buyShopGoodCount";
import { checkIsCurrencyOnlyGood } from "#src/services/shop/checkIsCurrencyOnlyGood";
import { checkIsPaimonsBargainsCharacterBuyable } from "#src/services/shop/checkIsPaimonsBargainsCharacterBuyable";
import { checkIsShopGoodOffered } from "#src/services/shop/checkIsShopGoodOffered";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { PAIMON_BARGAINS_TABS } from "#src/services/shop/constants";
import { countShopCost } from "#src/services/shop/countShopCost";
import { getPaimonsBargainsGoods } from "#src/services/shop/getPaimonsBargainsGoods";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { GAME_CREAM, GameScreen, ShopScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// What buying one offer leaves in the player's hands and in the shop's record
interface Bought {
  characters: Character[];
  inventory: Inventory;
  purchases: ShopPurchase[];
  wallet: Wallet;
}

// A good on offer: a Fate the shop's dataset gives, or a character or weapon of the rotation
type Offer =
  | { good: PaimonsBargainsGood; kind: ShopOfferKind.Character | ShopOfferKind.Weapon }
  | { good: ShopGood; kind: ShopOfferKind.Fate };
interface Props {
  // The Adventure Rank the player has reached, which opens the Fates the shop sells from it
  adventureRank: number;
  // The characters of the game's roster by id, whose names and data a character on offer is shown and joined from
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The game's words in the reader's language
  gameText: GameText;
  // The world's clock as a purchase reads it at the moment the purchase is made
  getWorldNow: () => Temporal.Instant;
  // The Fates the shop sells, as its dataset holds them, before their sale dates and rank are checked
  goods: ShopGood[];
  // The game's material table by item id, which each Fate's name is read from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and characters in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The world's clock as the screen shows it, which the Fates and offers on show and their refreshes are read at
  now: Temporal.Instant;
  // The rotation of characters and weapons the shop offers in turn
  rotation: PaimonsBargainsRotation;
  // The game's weapon table by weapon id, which each weapon on offer is named and defined from
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
// Every good bought, by its id and the moment it was bought, which each good's limit is counted from
const purchases = defineModel<ShopPurchase[]>("purchases", { required: true });
const {
  adventureRank,
  characterDataMap,
  gameText,
  getWorldNow,
  goods,
  materialDataMap,
  nameText,
  now,
  rotation,
  weaponDataMap,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const { count, goodId, resetShopPick } = useShopPick();
// The currency a cost is paid in; a cost the wallet does not trade is a bad row, as nothing here could pay for it
const currencyOf = (itemId: number): Currency => {
  const currency = ShopItemCurrencyMap[itemId];
  if (currency === undefined)
    throw new InvalidOperationError(Operation.Read, String(itemId), "is not a currency the shop trades in");
  return currency;
};
const offers = computed<Offer[]>(() => {
  const fates = goods.flatMap((good): Offer[] =>
    checkIsCurrencyOnlyGood(good) && checkIsShopGoodOffered(good, adventureRank, now)
      ? [{ good, kind: ShopOfferKind.Fate }]
      : [],
  );
  const { characterGoods, weaponGoods } = getPaimonsBargainsGoods(rotation, now);
  return [
    ...fates,
    ...characterGoods.map((good): Offer => ({ good, kind: ShopOfferKind.Character })),
    ...weaponGoods.map((good): Offer => ({ good, kind: ShopOfferKind.Weapon })),
  ];
});
// The tab the goods show on, the first until the player picks another, and the offers bought with its currency
const tabId = ref(takeOne(PAIMON_BARGAINS_TABS, 0).id);
const tabs = computed<ShopTabCell[]>(() =>
  PAIMON_BARGAINS_TABS.map(({ id, nameKey }) => ({ id, name: gameText[nameKey] })),
);
const shownOffers = computed(() => {
  const currency = PAIMON_BARGAINS_TABS.find(({ id }) => id === tabId.value)?.currency;
  return offers.value.filter(({ good }) => good.costs.some(({ itemId }) => currencyOf(itemId) === currency));
});
const nameOfCharacter = (characterId: number): string =>
  nameText[characterDataMap.get(characterId)?.nameTextId ?? ""] ?? "";
const getWeaponDefinition = (weaponId: number): ItemDefinition => {
  const weaponData = weaponDataMap.get(weaponId);
  if (!weaponData) throw new InvalidOperationError(Operation.Read, String(weaponId), "has no weapon data");
  return toWeaponDefinition(weaponData, nameText[weaponData.nameTextId] ?? "");
};
const pickedOffer = computed(() => offers.value.find(({ good }) => good.goodsId === goodId.value));
const balances = computed<CurrencyCount[]>(() =>
  Array.from(
    new Set(offers.value.flatMap(({ good }) => good.costs.map(({ itemId }) => currencyOf(itemId)))),
    (currency) => ({
      id: currency,
      isTopUp: false,
      name: gameText[takeOne(CurrencyGameTextKeyMap, currency)],
      quantity: wallet.value[currency],
    }),
  ),
);
// The name each offer is drawn under: a Fate's currency name, a character's name, or a weapon's name
const offerNames = computed(() =>
  shownOffers.value.map(({ good, kind }) => ({
    good,
    name:
      kind === ShopOfferKind.Fate
        ? gameText[takeOne(CurrencyGameTextKeyMap, currencyOf(good.itemId))]
        : kind === ShopOfferKind.Character
          ? nameOfCharacter(good.itemId)
          : getWeaponDefinition(good.itemId).name,
  })),
);
const shopGoodCells = useShopGoodCells({
  getCostName: (itemId) => gameText[takeOne(CurrencyGameTextKeyMap, currencyOf(itemId))],
  getGameText: () => gameText,
  getHeldCount: (itemId) => countShopCost(inventory.value, wallet.value, itemId),
  getNow: () => now,
  goods: offerNames,
  purchases,
});
// The Fates are drawn in the gold tone the reference gives them, the characters and weapons in the plain one.
// A character the player holds at its sixth constellation shows the game's sold-out line in place of its limit.
const goodCells = computed(() => {
  const goodsIdOfferMap = new Map(shownOffers.value.map((offer): [number, Offer] => [offer.good.goodsId, offer]));
  return shopGoodCells.value.map((cell): ShopGoodCell => {
    const offer = goodsIdOfferMap.get(cell.id);
    if (offer?.kind === ShopOfferKind.Fate) return { ...cell, tone: "gold" };
    if (
      offer?.kind === ShopOfferKind.Character &&
      !checkIsPaimonsBargainsCharacterBuyable(characters.value.find(({ id }) => id === offer.good.itemId))
    )
      return { ...cell, soldOutLabel: gameText[GameTextKey.ShopMaximumStellaFortuna] };
    return cell;
  });
});
// The most the picked good can be bought for: a Fate counts its limit left and the player's currency, a character or a
// Weapon of the rotation is bought one at a time
const countMaximum = computed(() => {
  if (!pickedOffer.value) return 0;
  const { good, kind } = pickedOffer.value;
  if (kind !== ShopOfferKind.Fate) return 1;
  const left = computeShopGoodLeft(good, purchases.value, now) ?? Number.POSITIVE_INFINITY;
  const affordable = Math.min(
    ...good.costs.map((cost) => (cost.count > 0 ? Math.floor(wallet.value[currencyOf(cost.itemId)] / cost.count) : 1)),
  );
  return Math.min(left, affordable);
});
// What buying an offer the count asks for leaves, or undefined where nothing is bought
const buyOffer = (offer: Offer, buyCount: number): Bought | undefined => {
  if (offer.kind === ShopOfferKind.Fate) {
    const bought = buyShopGoodCount(
      wallet.value,
      inventory.value,
      (itemId) => getItemDefinition(itemId, nameText, materialDataMap),
      purchases.value,
      offer.good,
      buyCount,
      adventureRank,
      getWorldNow(),
    );
    return bought.purchases === purchases.value ? undefined : { ...bought, characters: characters.value };
  }
  if (offer.kind === ShopOfferKind.Character) {
    const bought = buyPaimonsBargainsCharacter(
      wallet.value,
      characters.value,
      purchases.value,
      offer.good,
      characterDataMap,
      getWorldNow(),
    );
    return bought && { ...bought, inventory: inventory.value };
  }
  const bought = buyPaimonsBargainsWeapon(
    wallet.value,
    inventory.value,
    purchases.value,
    offer.good,
    getWeaponDefinition,
    getWorldNow(),
  );
  return bought && { ...bought, characters: characters.value };
};
</script>

<template>
  <!-- Paimon's Bargains, opened from the Paimon menu's Shop entry: the Fates the shop sells, and the characters and weapons of
       the month's rotation, each with its costs, limit and refresh, the count the player buys and the Buy button -->
  <GameScreen
    class="paimons-bargains"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.PaimonsBargains]"
    is-world-blurred
  >
    <ShopScreen
      v-model:count="count"
      v-model:good-id="goodId"
      v-model:tab-id="tabId"
      class="paimons-bargains-shop"
      :balances
      :buy-label="gameText[GameTextKey.ShopPurchase]"
      :close-label="gameText[GameTextKey.Back]"
      :count-label="gameText[GameTextKey.CraftingAmount]"
      :count-maximum
      :goods="goodCells"
      :tabs
      :title="gameText[GameTextKey.PaimonsBargains]"
      @buy="
        (good, buyCount) => {
          // Buys the picked good and keeps what the purchase leaves, then clears the picked good
          const offer = offers.find(({ good: offered }) => offered.goodsId === good.id);
          const bought = offer && buyOffer(offer, buyCount);
          if (!bought) return;
          characters = bought.characters;
          inventory = bought.inventory;
          purchases = bought.purchases;
          wallet = bought.wallet;
          resetShopPick();
        }
      "
      @close="emit('close')"
    />
  </GameScreen>
</template>

<style scoped>
/* The grid is the reference's top two rows at 1920 by 1080, measured off its pixels: four cards of 353.5 by 335 from 206 across and
   128 down, with gaps of 35.17 across (their lefts at 206, 594, 984 and 1372) and 37 down. Each name sits over its limit line, and
   each price in a band of 57 */
.paimons-bargains-shop :deep(.goods) {
  top: calc(var(--unit) * 128);
  left: calc(var(--unit) * 206);
  width: calc(var(--unit) * 1521);
  height: calc(var(--unit) * 952);
  grid-template-columns: repeat(4, calc(var(--unit) * 353.5));
  gap: calc(var(--unit) * 37) calc(var(--unit) * 35.17);
}

/* A card is a block, so its grid cell is its own height: an inline button leaves its line's descent under it, which put the
   second row 5 pixels low. Its fill runs from the purple of its top left corner to a lighter bottom, measured at the same
   corners of every card: top left (98, 89, 141), top right (120, 101, 150), bottom left (140, 118, 177), bottom right
   (145, 122, 180) */
.paimons-bargains-shop :deep(.good) {
  display: block;
  height: calc(var(--unit) * 335);
  background: linear-gradient(158deg, #62598d 0%, #786596 30%, #8c76b1 70%, #917ab4 100%);
}

/* The card's frame is a lighter ridge 3 pixels wide, 5 in from its edge, read off the reference's clean edges at about 16
   levels over the fill on each channel */
.paimons-bargains-shop :deep(.good)::after {
  position: absolute;
  inset: calc(var(--unit) * 5);
  border: calc(var(--unit) * 3) solid rgb(255 255 255 / 0.08);
  content: "";
  pointer-events: none;
}

/* The Fates' gold runs the same way: from (141, 99, 62) at the top left of the first two cards to (185, 135, 81) at the
   bottom right, where the price band takes over */
.paimons-bargains-shop :deep(.good[data-tone="gold"]) {
  background: linear-gradient(158deg, #8b613d 0%, #b2824e 50%, #c48e55 100%);
}

.paimons-bargains-shop :deep(.good-name) {
  top: auto;
  bottom: calc(var(--unit) * 105);
  color: v-bind(GAME_CREAM);
  font-size: calc(var(--unit) * 30);
  line-height: calc(var(--unit) * 37);
}

/* A card with no limit line names itself where the reference's limit line stands, just above its price band */
.paimons-bargains-shop :deep(.good:not(:has(.good-limit)) .good-name) {
  bottom: calc(var(--unit) * 64);
}

.paimons-bargains-shop :deep(.good-limit) {
  top: calc(var(--unit) * 239);
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
}

.paimons-bargains-shop :deep(.good-price) {
  height: calc(var(--unit) * 57);
  background: #4f586d;
  font-size: calc(var(--unit) * 28);
}

/* The price icon is a placeholder diamond; its side is set so its turned diagonal spans the reference's currency icon, 40 pixels
   across centred at (371, 436) in the first card's band */
.paimons-bargains-shop :deep(.good-price .price-icon) {
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 28);
}

/* The reference's tab row stands where the title does, so the title stays for a reader and is not drawn under the tabs */
.paimons-bargains-shop :deep(.heading) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

/* The tab row is the reference's, measured off its pixels: the picked tab a cream pill across 140 to 516 and 8 to 76 down, and
   the other two set in their own text, Stardust centred at 716 and Primogems, two lines, at 1104 */
.paimons-bargains-shop :deep(.tabs) {
  top: calc(var(--unit) * 8);
  left: calc(var(--unit) * 140);
  gap: 0;
}

.paimons-bargains-shop :deep(.tab) {
  height: calc(var(--unit) * 68);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 30);
}

.paimons-bargains-shop :deep(.tab[aria-pressed="true"]) {
  background: #c9c1b6;
}

/* The rule under the tab row is the reference's: a light line 2 pixels wide at 68, a dark shadow beneath it at 74 to 76,
   from the picked tab's edge at 520 to 1360 */
.paimons-bargains-shop :deep(.tabs)::after {
  position: absolute;
  top: calc(var(--unit) * 59);
  left: calc(var(--unit) * 380);
  width: calc(var(--unit) * 840);
  height: calc(var(--unit) * 10);
  background: linear-gradient(
    transparent calc(var(--unit) * 1),
    #62666c calc(var(--unit) * 1) calc(var(--unit) * 3),
    #464a51 calc(var(--unit) * 3) calc(var(--unit) * 4),
    transparent calc(var(--unit) * 4) calc(var(--unit) * 7),
    #25282f calc(var(--unit) * 7)
  );
  content: "";
  pointer-events: none;
}

.paimons-bargains-shop :deep(.tabs li:nth-child(1) .tab) {
  width: calc(var(--unit) * 376);
}

.paimons-bargains-shop :deep(.tabs li:nth-child(2)) {
  margin-left: calc(var(--unit) * 71);
}

.paimons-bargains-shop :deep(.tabs li:nth-child(2) .tab) {
  width: calc(var(--unit) * 257);
}

.paimons-bargains-shop :deep(.tabs li:nth-child(3)) {
  margin-left: calc(var(--unit) * 162);
}

.paimons-bargains-shop :deep(.tabs li:nth-child(3) .tab) {
  width: calc(var(--unit) * 196);
}

/* A character held at its sixth constellation shows the game's sold-out line as a red band across its card, its name above
   the band and its price band below, as the reference's Fischl card is drawn */
.paimons-bargains-shop :deep(.good-sold-out) {
  top: calc(var(--unit) * 186);
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--unit) * 86);
  padding: 0 calc(var(--unit) * 8);
  background: #c45a54;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 29);
}

.paimons-bargains-shop :deep(.good:has(.good-sold-out) .good-name) {
  bottom: calc(var(--unit) * 155);
}

/* The world behind the shop is the reference's own, read as the average of its clear margins and gutters in each 40 to 80
   pixel band down the frame. The stops from 460 down keep the screen's earlier values: a fit to the reference's lighter
   bottom lowered the shape of the cards' edges against it (see the Open items in the shops design) */
.paimons-bargains :deep(.world-wash) {
  background: linear-gradient(
    #2c3239 calc(var(--unit) * 40),
    #2e333c calc(var(--unit) * 120),
    #3d4146 calc(var(--unit) * 200),
    #504e50 calc(var(--unit) * 280),
    #48484e calc(var(--unit) * 360),
    #44464a calc(var(--unit) * 460),
    #8f8d86 calc(var(--unit) * 640),
    #8f8d86
  );
}
</style>
