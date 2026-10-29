import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// What deleting an account keeps, in the words the deletion spec gives, each a row of the confirmation's list
export const AccountDeletionKeptItems = [
  { meaning: UiIconMeaning.Summary, title: "Moderation records in other people's rooms that name you" },
  { meaning: UiIconMeaning.Recent, title: "Activity on resources you do not own" },
] as const;
