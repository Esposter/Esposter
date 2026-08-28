import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

// The enum value is the anchor a link scrolls to, so the heading text lives here rather than doubling as the id —
// One place naming each section for both the sidebar and the section it heads
export const UserSettingsPageSectionMap = {
  [UserSettingsPageSection.Profile]: { subtitle: "Your personal information", title: "Profile" },
  [UserSettingsPageSection.LinkedAccounts]: {
    subtitle: "The sign-in providers that reach this account",
    title: "Linked Accounts",
  },
  [UserSettingsPageSection.Sessions]: { subtitle: "The devices signed in to this account", title: "Sessions" },
} as const satisfies Record<UserSettingsPageSection, { subtitle: string; title: string }>;
