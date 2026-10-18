import type { ExcelShopRow } from "#src/models/genshinAssets/shops/ExcelShopRow";

import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The Reputation level a city's discount starts at, as the shop table's rows of that city give it. Every row that has a
// Discount gives the one level, and a city whose rows give two is an error, since its goods could not be priced one way
export const readCityDiscountLevel = (cityId: number): number => {
  const levels = [
    ...new Set(
      readExcelTable<ExcelShopRow>("ShopExcelConfigData")
        .filter((row) => row.cityId === cityId && row.cityDiscountLevel > 0)
        .map(({ cityDiscountLevel }) => cityDiscountLevel),
    ),
  ];
  const [level] = levels;
  if (levels.length !== 1 || level === undefined)
    throw new InvalidOperationError(Operation.Read, String(cityId), `gives ${levels.length} discount levels, not one`);
  return level;
};
