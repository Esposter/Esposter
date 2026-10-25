import { buildSouvenirSlice } from "#src/services/genshinAssets/shops/buildSouvenirSlice";
import { SOUVENIR_SIGIL_ITEM_IDS } from "#src/services/genshinAssets/shops/constants";

// The Souvenir Shops' goods, one record of the shops dataset for each region, the goods priced in that region's Sigil
// The Cryo Sigil prices no good in the table, so Snezhnaya gets no slice until a Souvenir Shop prices in it
export const buildSouvenirGoods = (): Record<string, unknown> => ({
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.fontaine, "souvenirFontaine"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.inazuma, "souvenirInazuma"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.liyue, "souvenirLiyue"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.mondstadt, "souvenirMondstadt"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.natlan, "souvenirNatlan"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.nodKrai, "souvenirNodKrai"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.sumeru, "souvenirSumeru"),
});
