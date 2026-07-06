import type { Promisable } from "type-fest";

import { AdminActionType } from "@esposter/db-schema";

type AdminActionHook = (roomId: string) => Promisable<void>;

// Derived from the enum values so a new AdminActionType is registered automatically.
export const AdminActionHookMap = Object.fromEntries(
  Object.values(AdminActionType).map((type) => [type, []]),
) as Record<AdminActionType, AdminActionHook[]>;
