import type { EditorFinding } from "@/models/editor/EditorFinding";

import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";

// An editor's findings: its check run over the document once an edit has settled on the autosave's cadence, so a finding
// clears with the save of the edit that fixed it. An edit replaces the document rather than mutating it, since the check
// is recomputed when the document's value changes
export const useEditorFindings = <TDocument>(
  document: MaybeRefOrGetter<TDocument>,
  check: (settledDocument: TDocument) => EditorFinding[],
) => {
  const settledDocument = refDebounced(
    computed(() => toValue(document)),
    RESOURCE_AUTOSAVE_DEBOUNCE_MS,
  );

  return computed(() => check(settledDocument.value));
};
