import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// What the archive leaves out, in the words the export's design gives, each a row of the settings card's list
export const DataExportOmittedItems = [
  {
    meaning: UiIconMeaning.Person,
    title: "Other people's messages, posts, comments and counts, and the rooms you have left",
  },
  {
    meaning: UiIconMeaning.Members,
    title: "Other people's records, such as their room memberships, roles and reactions",
  },
  { meaning: UiIconMeaning.Version, title: "Earlier versions of your resources, and their activity logs" },
  { meaning: UiIconMeaning.Image, title: "Thumbnails, which are made again from the attachments the archive holds" },
  { meaning: UiIconMeaning.Storage, title: "The storage ledger" },
  { meaning: UiIconMeaning.Lock, title: "Sessions, API keys and sign-in tokens" },
] as const;
