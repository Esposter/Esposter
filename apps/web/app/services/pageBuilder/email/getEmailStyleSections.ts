import type { EmailStyleField } from "#src/models/pageBuilder/EmailStyleField";
import type { EmailStyleSection } from "#src/models/pageBuilder/EmailStyleSection";

import { OTHER_STYLE_SECTOR_TITLE, STYLE_SECTORS } from "#src/services/pageBuilder/constants";
import { getAttributeSectorTitle } from "#src/services/pageBuilder/email/getAttributeSectorTitle";

// The sections an email node's fields are drawn under, in the webpage's sector order with Other last. A sector no field
// Falls under is left out, so a node is drawn only the sectors it has a field for
export const getEmailStyleSections = (fields: EmailStyleField[]): EmailStyleSection[] =>
  [...STYLE_SECTORS.map(({ title }) => title), OTHER_STYLE_SECTOR_TITLE]
    .map((title) => ({ fields: fields.filter((field) => getAttributeSectorTitle(field.name) === title), title }))
    .filter((section) => section.fields.length > 0);
