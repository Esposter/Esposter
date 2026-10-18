import { ID_SEPARATOR } from "@esposter/shared";

// The key an enemy spawns and is defeated under, from its camp and its member in that camp
export const getSpawnKey = (campId: string, memberId: string) => `${campId}${ID_SEPARATOR}${memberId}`;
