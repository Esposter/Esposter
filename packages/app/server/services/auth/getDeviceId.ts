import { Device } from "#shared/models/auth/Device";
import { ID_SEPARATOR } from "@esposter/shared";

export const getDeviceId = ({ sessionId, userId }: Device) => `${userId}${ID_SEPARATOR}${sessionId}`;
