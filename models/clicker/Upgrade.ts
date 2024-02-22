import { effectSchema } from "@/models/clicker/Effect";
import type { Effect } from "@/models/clicker/Effect";
import { unlockConditionSchema } from "@/models/clicker/unlockCondition/UnlockCondition";
import type { UnlockCondition } from "@/models/clicker/unlockCondition/UnlockCondition";
import type { UpgradeName } from "@/models/clicker/UpgradeName";
import { z } from "zod";

export interface Upgrade<TName = UpgradeName> {
  name: TName;
  description: string;
  flavorDescription: string;
  price: number;
  effects: Effect[];
  unlockConditions: UnlockCondition[];
}

export const createUpgradeSchema = <TNameSchema extends z.ZodTypeAny = z.ZodType<UpgradeName>>(
  nameSchema: TNameSchema,
) =>
  z.object({
    name: nameSchema,
    description: z.string().min(1),
    flavorDescription: z.string().min(1),
    price: z.number(),
    effects: z.array(effectSchema).min(1),
    unlockConditions: z.array(unlockConditionSchema),
  });
