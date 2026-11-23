import {
  INAZUMA_GENERAL_GOODS_SHOP_ID,
  LIYUE_GENERAL_GOODS_SHOP_ID,
  MONDSTADT_GENERAL_GOODS_SHOP_ID,
} from "#src/services/shop/constants";
import { GameTextKey } from "genshin-text";

// The title a shop's screen names it by, for the shops whose title is not the Shop's own.
// The shop table types the three General Goods shops as grocery: SHOP_TYPE_GROCERY, SHOP_TYPE_LIYUE_GROCERY and
// SHOP_TYPE_INAZUMA_GROCERY. Each is titled General Goods.
export const ShopTitleGameTextKeyMap: ReadonlyMap<number, GameTextKey> = new Map([
  [INAZUMA_GENERAL_GOODS_SHOP_ID, GameTextKey.ShopGeneralGoods],
  [LIYUE_GENERAL_GOODS_SHOP_ID, GameTextKey.ShopGeneralGoods],
  [MONDSTADT_GENERAL_GOODS_SHOP_ID, GameTextKey.ShopGeneralGoods],
]);
