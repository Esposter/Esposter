import type { PropertyNames } from "@esposter/shared";
import type { DocsCollectionItem } from "@nuxt/content";

import { getPropertyNames } from "@esposter/shared";

export const DocsCollectionItemPropertyNames: PropertyNames<DocsCollectionItem> =
  getPropertyNames<DocsCollectionItem>();
