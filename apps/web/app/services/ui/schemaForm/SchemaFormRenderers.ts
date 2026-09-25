import type { SchemaFormLayout } from "#shared/models/schemaForm/SchemaFormLayout";
import type { JsonFormsRendererRegistryEntry, JsonSchema } from "@jsonforms/core";

import UiSchemaFormArray from "@/components/Ui/SchemaForm/Array.vue";
import UiSchemaFormCheckbox from "@/components/Ui/SchemaForm/Checkbox.vue";
import UiSchemaFormHidden from "@/components/Ui/SchemaForm/Hidden.vue";
import UiSchemaFormLayout from "@/components/Ui/SchemaForm/Layout.vue";
import UiSchemaFormObject from "@/components/Ui/SchemaForm/Object.vue";
import UiSchemaFormOneOf from "@/components/Ui/SchemaForm/OneOf.vue";
import UiSchemaFormSelect from "@/components/Ui/SchemaForm/Select.vue";
import UiSchemaFormText from "@/components/Ui/SchemaForm/Text.vue";
import {
  and,
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isLayout,
  isNumberControl,
  isObjectControl,
  isOneOfControl,
  isOneOfEnumControl,
  isPrimitiveArrayControl,
  isStringControl,
  not,
  or,
  rankWith,
  schemaMatches,
  schemaTypeIs,
} from "@jsonforms/core";

const hasItemsKey = schemaMatches((schema) => Boolean((schema as { layout?: SchemaFormLayout }).layout?.itemsKey));
const hasConst = schemaMatches((schema: JsonSchema) => schema.const !== undefined);
// Which of the library's renderers draws each node of a schema form, the highest rank winning: a layout stacks its
// Elements, an object and a list draw their own, a fixed value draws nothing, a choice is the library's select, a
// Union's variant is chosen in it, and text, numbers and booleans are the library's fields. A new kind of node is one
// Entry here
export const SchemaFormRenderers: JsonFormsRendererRegistryEntry[] = [
  { renderer: UiSchemaFormLayout, tester: rankWith(1, isLayout) },
  { renderer: UiSchemaFormObject, tester: rankWith(2, isObjectControl) },
  { renderer: UiSchemaFormArray, tester: rankWith(2, schemaTypeIs("array")) },
  { renderer: UiSchemaFormHidden, tester: rankWith(20, hasConst) },
  {
    renderer: UiSchemaFormSelect,
    tester: rankWith(
      10,
      or(isEnumControl, isOneOfEnumControl, and(or(isStringControl, isPrimitiveArrayControl), hasItemsKey)),
    ),
  },
  { renderer: UiSchemaFormOneOf, tester: rankWith(10, and(isOneOfControl, not(isOneOfEnumControl))) },
  { renderer: UiSchemaFormText, tester: rankWith(5, or(isStringControl, isNumberControl, isIntegerControl)) },
  { renderer: UiSchemaFormCheckbox, tester: rankWith(5, isBooleanControl) },
];
