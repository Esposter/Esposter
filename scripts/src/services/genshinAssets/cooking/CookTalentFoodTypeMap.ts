import { CookingFoodType } from "genshin-world";

// The kind of dish a cooking talent's food type parameter names by its number, as the table numbers them
export const CookTalentFoodTypeMap: Record<string, CookingFoodType> = {
  "1": CookingFoodType.Heal,
  "2": CookingFoodType.Attack,
  "3": CookingFoodType.Function,
  "4": CookingFoodType.Defense,
};
