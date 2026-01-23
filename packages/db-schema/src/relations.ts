import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";
import { appUsersInMessageRelation } from "@/relations/appUsersInMessageRelation";
import { postsRelation } from "@/relations/postsRelation";
import { pushSubscriptionsInMessageRelation } from "@/relations/pushSubscriptionsInMessageRelation";
import { roomsInMessageRelation } from "@/relations/roomsInMessageRelation";

export const relations = {
  ...accountsRelation,
  ...achievementsRelation,
  ...appUsersInMessageRelation,
  ...postsRelation,
  ...pushSubscriptionsInMessageRelation,
  ...roomsInMessageRelation,
};
