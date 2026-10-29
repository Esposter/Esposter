import type { UiSchemaFormConfiguration } from "@/models/ui/schemaForm/UiSchemaFormConfiguration";
import type { UiSchemaFormRendererProps } from "@/models/ui/schemaForm/UiSchemaFormRendererProps";

import { getSchemaFormLayout } from "@/services/ui/schemaForm/getSchemaFormLayout";
import { mapDispatchToControlProps, mapStateToControlProps } from "@jsonforms/core";

// What every field of a schema form reads beside JSON Forms' own control: its layout meta, and the schema's issue at
// Its path once the reader has changed it, so a form opened empty does not open covered in what it still needs
export const useSchemaFormControl = (props: UiSchemaFormRendererProps) => {
  const control = computed(() => ({ ...props, ...mapStateToControlProps(props.form.state, props) }));
  const { handleChange } = mapDispatchToControlProps(props.form.dispatch);
  const isChanged = ref(false);
  const uiSchemaFormConfiguration = computed(() => control.value.config as UiSchemaFormConfiguration);
  const layout = computed(() => getSchemaFormLayout(control.value.schema) ?? {});
  const issue = computed(() =>
    isChanged.value ? uiSchemaFormConfiguration.value.issueMap.get(control.value.path) : undefined,
  );
  const change = (value: unknown) => {
    isChanged.value = true;
    handleChange(control.value.path, value);
  };
  return { change, control, issue, layout, uiSchemaFormConfiguration };
};
