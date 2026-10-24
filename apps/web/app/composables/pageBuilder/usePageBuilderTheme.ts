import type { MaybeRefOrGetter } from "vue";

import { DEFAULT_THEME_COLOR, ROOT_POINTER } from "@/services/pageBuilder/constants";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { JsonPatchOperationType, noop } from "@esposter/shared";

// The page's colour tokens, edited through the page builder's history. A new colour takes the next free name, and no colour
// Can be deleted here, so a name is never given to two colours
export const usePageBuilderTheme = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const colors = computed(() => {
    const document = getDocument(toValue(resourceId));
    return Object.entries(document?.root.props.tokens ?? {}).map(([name, value]) => ({ name, value }));
  });
  const setTokenValue = (name: string, value: string, label: string) => {
    applyEdit(
      toValue(resourceId),
      [{ op: JsonPatchOperationType.Add, path: `${ROOT_POINTER}/props/tokens/${name}`, value }],
      label,
      `theme:${name}`,
    ).match(noop, console.error);
  };
  const setColor = (name: string, value: string) => {
    setTokenValue(name, value, "Edit colour");
  };
  const addColor = () => {
    setTokenValue(`color-new-${colors.value.length + 1}`, DEFAULT_THEME_COLOR, "Add colour");
  };

  return { addColor, colors, setColor };
};
