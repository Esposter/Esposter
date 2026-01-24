import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";
import { appUsersInMessageRelation } from "@/relations/appUsersInMessageRelation";
import { invitesInMessageRelation } from "@/relations/invitesInMessageRelation";
import { postsRelation } from "@/relations/postsRelation";
import { pushSubscriptionsInMessageRelation } from "@/relations/pushSubscriptionsInMessageRelation";
import { roomsInMessageRelation } from "@/relations/roomsInMessageRelation";
import { sessionsRelation } from "@/relations/sessionsRelation";
import { surveysRelation } from "@/relations/surveysRelation";
import { userAchievementsRelation } from "@/relations/userAchievementsRelation";
import { usersRelation } from "@/relations/usersRelation";
import { usersToRoomsInMessageRelation } from "@/relations/usersToRoomsInMessageRelation";
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
  ...userAchievementsRelation,
  ...usersRelation,
  ...usersToRoomsInMessageRelation,
  ...webhooksInMessageRelation,
};
