import type { Extension } from "@codemirror/state";

import { uiEditorExtensions } from "@/services/codemirror/uiEditorExtensions";

export const useExtensions = (baseExtensions: MaybeRef<Extension[]>) =>
  computed(() => [...unref(baseExtensions), ...uiEditorExtensions]);
