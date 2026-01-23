import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";

export const relations = {
  ...accountsRelation,
  ...achievementsRelation,
};
