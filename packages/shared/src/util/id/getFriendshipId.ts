import { ID_SEPARATOR } from "#src/util/id/constants";

// The friendship's natural key: its two user ids sorted and joined, so either side of a friendship names the same id
export const getFriendshipId = (userIdA: string, userIdB: string): string =>
  [userIdA, userIdB].toSorted().join(ID_SEPARATOR);
