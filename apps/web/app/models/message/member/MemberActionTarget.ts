import type { PublicUser } from "@esposter/db-schema";

// The member a moderation dialog acts on, as its title names them and its action targets them
export interface MemberActionTarget {
  displayName: string;
  user: Pick<PublicUser, "id">;
}
