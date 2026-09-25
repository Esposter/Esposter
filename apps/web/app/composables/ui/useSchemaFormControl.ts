import type { UiSchemaFormConfig } from "@/models/ui/UiSchemaFormConfig";
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

import { getSchemaFormLayout } from "@/services/ui/schemaForm/getSchemaFormLayout";
import { useJsonFormsControl } from "@jsonforms/vue";

// What every field of a schema form reads beside JSON Forms' own control: its layout meta, and the schema's issue at
// Its path once the reader has changed it, so a form opened empty does not open covered in what it still needs
export const useSchemaFormControl = (props: UiSchemaFormRendererProps) => {
  const { control, handleChange } = useJsonFormsControl(props);
  const isChanged = ref(false);
  const config = computed(() => control.value.config as UiSchemaFormConfig);
  const layout = computed(() => getSchemaFormLayout(control.value.schema) ?? {});
  const issue = computed(() => (isChanged.value ? config.value.issueMap.get(control.value.path) : undefined));
  const change = (value: unknown) => {
    isChanged.value = true;
    handleChange(control.value.path, value);
  };
  return { change, config, control, issue, layout };
};
