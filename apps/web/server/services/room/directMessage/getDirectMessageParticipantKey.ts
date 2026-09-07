import { ID_SEPARATOR } from "@esposter/shared";

export const getDirectMessageParticipantKey = (userIds: string[]) =>
  [...new Set(userIds)].toSorted().join(ID_SEPARATOR);
