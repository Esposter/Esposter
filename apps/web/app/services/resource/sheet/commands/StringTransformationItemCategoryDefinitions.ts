import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { prettify } from "#src/util/text/prettify";

export const StringTransformationItemCategoryDefinitions: SelectItemCategoryDefinition<StringTransformationType>[] =
  Object.values(StringTransformationType).map((transformationType) => ({
    title: prettify(transformationType),
    value: transformationType,
  }));
