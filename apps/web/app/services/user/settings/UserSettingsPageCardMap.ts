import type { Component } from "vue";

import UserApiKeysCard from "#src/components/User/ApiKeysCard/Index.vue";
import UserDataExportCard from "#src/components/User/DataExportCard/Index.vue";
import UserDeleteAccountCard from "#src/components/User/DeleteAccountCard/Index.vue";
import UserLinkedAccountsCard from "#src/components/User/LinkedAccountsCard/Index.vue";
import UserProfileCard from "#src/components/User/ProfileCard/Index.vue";
import UserSessionsCard from "#src/components/User/SessionsCard/Index.vue";
import { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

// The card each section of the settings page is drawn with. Keyed by every section, so a section without a card is a
// Type error rather than a sidebar link that leads nowhere
export const UserSettingsPageCardMap = {
  [UserSettingsPageSection.ApiKeys]: UserApiKeysCard,
  [UserSettingsPageSection.DataExport]: UserDataExportCard,
  [UserSettingsPageSection.DeleteAccount]: UserDeleteAccountCard,
  [UserSettingsPageSection.LinkedAccounts]: UserLinkedAccountsCard,
  [UserSettingsPageSection.Profile]: UserProfileCard,
  [UserSettingsPageSection.Sessions]: UserSessionsCard,
} as const satisfies Record<UserSettingsPageSection, Component>;
