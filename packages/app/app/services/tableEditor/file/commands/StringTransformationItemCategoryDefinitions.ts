import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { prettify } from "@/util/text/prettify";

export const StringTransformationItemCategoryDefinitions: SelectItemCategoryDefinition<BasicStringTransformationType>[] =
  [
    { title: prettify(BasicStringTransformationType.Lowercase), value: BasicStringTransformationType.Lowercase },
    { title: prettify(BasicStringTransformationType.TitleCase), value: BasicStringTransformationType.TitleCase },
    { title: prettify(BasicStringTransformationType.Trim), value: BasicStringTransformationType.Trim },
    { title: prettify(BasicStringTransformationType.Uppercase), value: BasicStringTransformationType.Uppercase },
  ];
