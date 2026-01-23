import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";
import { appUsersInMessageRelation } from "@/relations/appUsersInMessageRelation";
import { invitesInMessageRelation } from "@/relations/invitesInMessageRelation";

export const relations = {
  ...accountsRelation,
  ...achievementsRelation,
  ...appUsersInMessageRelation,
  ...invitesInMessageRelation,
};
