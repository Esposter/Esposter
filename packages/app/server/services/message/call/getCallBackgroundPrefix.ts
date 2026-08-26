import type { User } from "@esposter/db-schema";

// Every one of a user's call backgrounds lives under this one prefix, so the listing that renders the picker
// And the sweep that reclaims a slot name the same set without either holding a list of its own
export const getCallBackgroundPrefix = (userId: User["id"]) => `${userId}/CallBackground/`;
