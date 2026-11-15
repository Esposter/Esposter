import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { prettify } from "#src/util/text/prettify";

export const StringTransformationItemCategoryDefinitions: SelectItemCategoryDefinition<StringTransformationType>[] = [
  { title: prettify(StringTransformationType.LowerCase), value: StringTransformationType.LowerCase },
  { title: prettify(StringTransformationType.TitleCase), value: StringTransformationType.TitleCase },
  { title: prettify(StringTransformationType.Trim), value: StringTransformationType.Trim },
  { title: prettify(StringTransformationType.UpperCase), value: StringTransformationType.UpperCase },
];
