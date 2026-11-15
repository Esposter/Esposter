import { z } from "zod";

// Who a dish's heal reaches when it is eaten: the character selected to eat it, or every character in the party
export const DishTarget = { Party: "Party", Selected: "Selected" } as const;
export type DishTarget = (typeof DishTarget)[keyof typeof DishTarget];

export const dishTargetSchema = z.enum(DishTarget) satisfies z.ZodType<DishTarget>;
