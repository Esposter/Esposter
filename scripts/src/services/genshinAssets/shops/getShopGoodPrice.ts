import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

// The one item a good is bought with, its id and count. A good that costs no item, or several, has no single price here,
// Since its slots are filled by a currency the shop takes instead
export const getShopGoodPrice = ({ costItems }: ExcelShopGoodsRow): undefined | { count: number; id: number } => {
  const pricedSlots = costItems.flatMap(({ count = 0, id = 0 }) => (count > 0 && id > 0 ? [{ count, id }] : []));
  return pricedSlots.length === 1 ? pricedSlots[0] : undefined;
};
