import { z } from "zod";

// The kind of a dish, spelt as the cook recipe table spells it, so a dish's kind is published as the table gives it. A
// Passive or a cooking talent names the kinds it bonuses or doubles, and a dish is one of them
export enum CookingFoodType {
  Attack = "COOK_FOOD_ATTACK",
  Defense = "COOK_FOOD_DEFENSE",
  Function = "COOK_FOOD_FUNCTION",
  Heal = "COOK_FOOD_HEAL",
}

export const cookingFoodTypeSchema = z.enum(CookingFoodType) satisfies z.ZodType<CookingFoodType>;
