import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";

export const InviteExpireAfterSelectItems: SelectItemCategoryDefinition<CreateInviteInput["expireAfterMinutes"]>[] = [
  ...Object.entries(InviteExpireAfterMinutesMap).map(([title, value]) => ({ title, value })),
  { title: "Never", value: 0 },
];
