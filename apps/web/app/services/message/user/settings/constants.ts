import { createTable } from "#src/services/shared/overlay/createTable";
import { userSettingsInMessage } from "@esposter/db-schema";

// The name the user settings dialog and its navigation are announced by
export const USER_SETTINGS_LABEL = "User settings";

// The idle threshold is stored in milliseconds and edited in minutes
export const MS_PER_MINUTE: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

// The settings row the overlay holds, one slot, keyed by the user it belongs to
export const userSettingsTable = createTable(userSettingsInMessage);
