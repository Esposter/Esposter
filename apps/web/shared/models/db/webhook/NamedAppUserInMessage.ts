import type { AppUserInMessage } from "@esposter/db-schema";

// A bot identity as a read answers it: its own columns, and the name its webhook gives it
export type NamedAppUserInMessage = AppUserInMessage & { name: string };
