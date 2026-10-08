// The fields read off one row of the game's cook bonus table: the character whose special dish the bonus names, the
// Recipe it applies to, the bonus's type, its special dish's item id as the first parameter, and each quality's chance
// As the complex parameters, in the order of the recipe's results
export interface CookBonusRow {
  avatarId: number;
  bonusType: string;
  complexParamVec: number[];
  paramVec: number[];
  recipeId: number;
}
