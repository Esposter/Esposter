import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// What deleting an account keeps, in the words the deletion spec gives, each a row of the confirmation's list
export const AccountDeletionKeptItems = [
  { meaning: UiIconMeaning.Storage, title: "Shared character-pack files" },
  { meaning: UiIconMeaning.Summary, title: "Moderation records that name your account" },
  { meaning: UiIconMeaning.Recent, title: "Activity on resources you do not own" },
] as const;
