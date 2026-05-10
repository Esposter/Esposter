import { RoomPermission } from "@esposter/db-schema";

export const MANAGEMENT_PERMISSIONS =
  RoomPermission.ManageRoom | RoomPermission.ManageRoles | RoomPermission.ManageWebhooks | RoomPermission.Administrator;
