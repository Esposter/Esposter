import { ID_SEPARATOR } from "@esposter/shared";

// The friendship's natural key, as apps/web's getFriendshipId builds it, so a seeded friendship has the id the app reads
export const getSeedFriendshipId = (userIdA: string, userIdB: string): string =>
  [userIdA, userIdB].toSorted().join(ID_SEPARATOR);
