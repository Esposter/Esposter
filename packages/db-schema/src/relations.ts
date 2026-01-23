import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";
import { appUsersInMessageRelation } from "@/relations/appUsersInMessageRelation";

export const relations = {
  ...accountsRelation,
  ...achievementsRelation,
  ...appUsersInMessageRelation,
};
