import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import { prettify } from "@/util/text/prettify";

export const StringTransformationItemCategoryDefinitions: SelectItemCategoryDefinition<StringTransformationType>[] = [
  { title: prettify(StringTransformationType.LowerCase), value: StringTransformationType.LowerCase },
  { title: prettify(StringTransformationType.TitleCase), value: StringTransformationType.TitleCase },
  { title: prettify(StringTransformationType.Trim), value: StringTransformationType.Trim },
  { title: prettify(StringTransformationType.UpperCase), value: StringTransformationType.UpperCase },
];
