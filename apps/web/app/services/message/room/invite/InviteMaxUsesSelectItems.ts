import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { pluralize } from "#shared/util/text/pluralize";

export const InviteMaxUsesSelectItems: SelectItemCategoryDefinition<CreateInviteInput["maxUses"]>[] = [
  { title: "No limit", value: 0 },
  ...INVITE_MAX_USES_OPTIONS.map((uses) => ({ title: `${uses} ${pluralize("use", uses)}`, value: uses })),
];
