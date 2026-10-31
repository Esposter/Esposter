import { COLOR_TOKEN_PREFIX, FONT_TOKEN_PREFIX } from "#shared/services/pageBuilder/constants";
import { DEFAULT_FONT_STACK, DEFAULT_THEME_COLOR, ROOT_POINTER } from "@/services/pageBuilder/constants";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { JsonPatchOperationType, noop } from "@esposter/shared";

// The page's colour and font-stack tokens, edited through the page builder's history. A new token takes the next free name
// Of its kind, and no token can be deleted here, so a name is never given to two tokens
export const usePageBuilderTheme = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  const tokens = computed(() => {
    const document = getDocument(toValue(resourceId));
    return Object.entries(document?.root.props.tokens ?? {}).map(([name, value]) => ({ name, value }));
  });
  const colors = computed(() => tokens.value.filter(({ name }) => name.startsWith(COLOR_TOKEN_PREFIX)));
  const fonts = computed(() => tokens.value.filter(({ name }) => name.startsWith(FONT_TOKEN_PREFIX)));
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
    setTokenValue(`${COLOR_TOKEN_PREFIX}new-${colors.value.length + 1}`, DEFAULT_THEME_COLOR, "Add colour");
  };
  // An empty stack is not saved: a custom property with no value would make every use of it fall back to the initial value
  const setFontStack = (name: string, value: string) => {
    if (value !== "") setTokenValue(name, value, "Edit font stack");
  };
  const addFontStack = () => {
    setTokenValue(`${FONT_TOKEN_PREFIX}new-${fonts.value.length + 1}`, DEFAULT_FONT_STACK, "Add font stack");
  };

  return { addColor, addFontStack, colors, fonts, setColor, setFontStack };
};
