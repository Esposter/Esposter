// The cooking a player has done: the ids of the dishes they have learned from their instructions, and each dish's
// Proficiency by its id, a dish with none held at zero
export interface CookingProgress {
  learnedRecipeIds: number[];
  proficiencies: Record<number, number>;
}
