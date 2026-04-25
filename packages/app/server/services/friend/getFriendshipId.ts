import { ID_SEPARATOR } from "@esposter/shared";

export const getFriendshipId = (userIdA: string, userIdB: string) => [userIdA, userIdB].toSorted().join(ID_SEPARATOR);
