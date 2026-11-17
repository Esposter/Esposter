import type { EmailStyleField } from "#src/models/pageBuilder/EmailStyleField";

// A sector of an email node's style fields: the sector's title, and the fields drawn under it
export interface EmailStyleSection {
  fields: EmailStyleField[];
  title: string;
}
