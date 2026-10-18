import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { GameTextKey } from "genshin-text";

// The Left line a good shows for each refresh its limit comes back on. A good that never refreshes shows none
export const ShopRefreshLimitGameTextKeyMap: Partial<Record<ShopRefresh, GameTextKey>> = {
  [ShopRefresh.Daily]: GameTextKey.ShopLimitDaily,
  [ShopRefresh.Monthly]: GameTextKey.ShopLimitMonthly,
  [ShopRefresh.Weekly]: GameTextKey.ShopLimitWeekly,
};
