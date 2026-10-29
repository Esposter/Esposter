import type { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";

import { ElementTags } from "#shared/models/pageBuilder/html/ElementTag";

export const checkIsElementTag = (value: string): value is ElementTag => ElementTags.has(value);
