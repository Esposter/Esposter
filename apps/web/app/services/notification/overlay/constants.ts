import { createTable } from "#src/services/shared/overlay/createTable";
import { notificationsInNotification } from "@esposter/db-schema";

// A notification row, held by its id
export const notificationTable = createTable(notificationsInNotification);
