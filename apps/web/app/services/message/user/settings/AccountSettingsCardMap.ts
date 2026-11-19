import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import UserLinkedAccountsCard from "#src/components/User/LinkedAccountsCard/Index.vue";
import UserProfileCard from "#src/components/User/ProfileCard/Index.vue";
import { AccountSettingsSection } from "#src/models/message/user/settings/AccountSettingsSection";

// The card each account section is drawn with. Keyed by every section, so a section without a card is a type error
// Rather than a heading with nothing under it
export const AccountSettingsCardMap = {
  [AccountSettingsSection.LinkedAccounts]: UserLinkedAccountsCard,
  [AccountSettingsSection.Profile]: UserProfileCard,
} as const satisfies Record<AccountSettingsSection, Component<{ section?: UserSettingsPageSection }>>;
