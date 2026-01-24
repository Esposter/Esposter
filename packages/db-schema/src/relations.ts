import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";
import { appUsersInMessageRelation } from "@/relations/appUsersInMessageRelation";
import { invitesInMessageRelation } from "@/relations/invitesInMessageRelation";
import { postsRelation } from "@/relations/postsRelation";
import { pushSubscriptionsInMessageRelation } from "@/relations/pushSubscriptionsInMessageRelation";
import { roomsInMessageRelation } from "@/relations/roomsInMessageRelation";
import { sessionsRelation } from "@/relations/sessionsRelation";
import { surveysRelation } from "@/relations/surveysRelation";
import { usersRelation } from "@/relations/usersRelation";
import { webhooksInMessageRelation } from "@/relations/webhooksInMessageRelation";

export const relations = {
  ...accountsRelation,
  ...achievementsRelation,
  ...appUsersInMessageRelation,
  ...invitesInMessageRelation,
  ...postsRelation,
  ...pushSubscriptionsInMessageRelation,
  ...roomsInMessageRelation,
  ...sessionsRelation,
  ...surveysRelation,
  ...usersRelation,
  ...webhooksInMessageRelation,
};
