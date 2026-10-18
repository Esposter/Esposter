import { z } from "zod";

// Who a dish's heal reaches when it is eaten: the character selected to eat it, or every character in the party
export enum DishTarget {
  Party = "Party",
  Selected = "Selected",
}

export const dishTargetSchema = z.enum(DishTarget);
