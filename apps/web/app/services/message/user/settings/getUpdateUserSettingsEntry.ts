import type { UpdateUserSettingsInput } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { userSettingsTable } from "#src/services/message/user/settings/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";
import { omitUndefined } from "@esposter/shared";

// The record the write leaves at once: the fields it names, over the settings held for the user. A record the user does
// Not hold yet has nothing to change, so the entry shows nothing for it
export const getUpdateUserSettingsEntry = (userId: string, input: UpdateUserSettingsInput): Entry =>
  getHeldRowEntry(userSettingsTable, [userId], (userSettingsRow) => ({ ...userSettingsRow, ...omitUndefined(input) }));
