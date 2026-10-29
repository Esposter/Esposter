import type { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";

import { ElementAttributes } from "#shared/models/pageBuilder/html/ElementAttribute";

export const checkIsElementAttribute = (value: string): value is ElementAttribute => ElementAttributes.has(value);
