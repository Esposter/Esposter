import type { PropertyNames } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

export const ProcessProperties: PropertyNames<NodeJS.ProcessEnv> = getPropertyNames<NodeJS.ProcessEnv>();
