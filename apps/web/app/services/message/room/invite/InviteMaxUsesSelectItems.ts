import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";

export const InviteMaxUsesSelectItems: SelectItemCategoryDefinition<CreateInviteInput["maxUses"]>[] = [
  { title: "No limit", value: 0 },
  ...INVITE_MAX_USES_OPTIONS.map((uses) => ({ title: `${uses} use${uses === 1 ? "" : "s"}`, value: uses })),
];
