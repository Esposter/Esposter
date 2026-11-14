import type { UserStatusInMessage } from "@esposter/db-schema";

// A member as a room holds them while they are online: connected, with no status set
export const createOnlineStatus = (userId: string): UserStatusInMessage => ({
  createdAt: new Date(0),
  deletedAt: null,
  expiresAt: null,
  isConnected: true,
  message: "",
  status: null,
  updatedAt: new Date(0),
  userId,
});
