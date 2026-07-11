import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";

export const DEFAULT_INVITE_EXPIRE_AFTER_MINUTES = InviteExpireAfterMinutesMap["7 days"];
// Discord's invite max-use options; "No limit" (null) lives in the select
export const INVITE_MAX_USES_OPTIONS = [1, 5, 10, 25, 50, 100] as const;
