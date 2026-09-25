import type { SchemaFormLayout } from "#shared/models/schemaForm/SchemaFormLayout";
import type { JsonFormsRendererRegistryEntry, JsonSchema } from "@jsonforms/core";

import UiSchemaFormCheckbox from "@/components/Ui/SchemaForm/Checkbox.vue";
import UiSchemaFormHidden from "@/components/Ui/SchemaForm/Hidden.vue";
import UiSchemaFormOneOf from "@/components/Ui/SchemaForm/OneOf.vue";
import UiSchemaFormSelect from "@/components/Ui/SchemaForm/Select.vue";
import UiSchemaFormText from "@/components/Ui/SchemaForm/Text.vue";
import {
  and,
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isNumberControl,
  isOneOfControl,
  isOneOfEnumControl,
  isPrimitiveArrayControl,
  isStringControl,
  not,
  or,
  rankWith,
  schemaMatches,
} from "@jsonforms/core";
import { vanillaRenderers } from "@jsonforms/vue-vanilla";

const hasItemsKey = schemaMatches((schema) => Boolean((schema as { layout?: SchemaFormLayout }).layout?.itemsKey));
const hasConst = schemaMatches((schema: JsonSchema) => schema.const !== undefined);
// JSON Forms' own renderers lay out objects, groups and arrays in the library's classes, and every field is the
// Library's own, ranked above them: a fixed value draws nothing, a choice is the library's select, a union's variant is
// Chosen in it, and text, numbers and booleans are the library's fields. Raw, because JSON Forms keeps its renderers in
// Reactive state, which would otherwise proxy every component it renders
export const SchemaFormRenderers: JsonFormsRendererRegistryEntry[] = markRaw([
  ...vanillaRenderers,
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
]);
