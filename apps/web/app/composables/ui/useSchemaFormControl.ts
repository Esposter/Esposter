import type { UiSchemaFormConfiguration } from "@/models/ui/UiSchemaFormConfiguration";
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

import { getSchemaFormLayout } from "@/services/ui/schemaForm/getSchemaFormLayout";
import { mapDispatchToControlProps, mapStateToControlProps } from "@jsonforms/core";

// What every field of a schema form reads beside JSON Forms' own control: its layout meta, and the schema's issue at
// Its path once the reader has changed it, so a form opened empty does not open covered in what it still needs
export const useSchemaFormControl = (props: UiSchemaFormRendererProps) => {
  const control = computed(() => ({ ...props, ...mapStateToControlProps(props.form.state, props) }));
  const isChanged = ref(false);
  const config = computed(() => control.value.config as UiSchemaFormConfiguration);
  const layout = computed(() => getSchemaFormLayout(control.value.schema) ?? {});
  const issue = computed(() => (isChanged.value ? config.value.issueMap.get(control.value.path) : undefined));
  const change = (value: unknown) => {
    isChanged.value = true;
    mapDispatchToControlProps(props.form.dispatch).handleChange(control.value.path, value);
  };
  return { change, config, control, issue, layout };
};
