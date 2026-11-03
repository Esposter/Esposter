<script setup lang="ts">
import type { SurveyDocument } from "survey-engine";

import { useAlertStore } from "@/store/alert";
import { useSurveyStore } from "@/store/survey";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { ResourceType } from "@esposter/db-schema";
import { checkSurveyDocument } from "survey-engine";

const surveyStore = useSurveyStore();
const { document: storedDocument } = storeToRefs(surveyStore);
const { loadContent, saveDocument } = surveyStore;
const surveyCreatorStore = useSurveyCreatorStore();
const { document: editedDocument } = storeToRefs(surveyCreatorStore);
const { load } = surveyCreatorStore;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { sweep, track } = useSurveyFiles();
// The creator holds its own copy of the document, so a restore is loaded into it, not left the pre-restore one
useAdoptResourceContent(ResourceType.Survey, () => {
  load(storedDocument.value);
});
// Deletion waits for the close: until then a removal can still be undone, so an unreferenced file must not go sooner.
// It runs before the unmount rather than after it, so a blade swapped for another survey's sweeps its own document before the
// Next one loads into the same stores
onBeforeUnmount(() => {
  sweep(editedDocument.value);
});
await loadContent();
load(storedDocument.value);
track(storedDocument.value);
// A document the survey check refuses is not written: its first issue is shown, and the save reports the refusal
const saveEditedDocument = (newDocument: SurveyDocument) => {
  const [issue] = checkSurveyDocument(newDocument);
  if (issue) {
    createAlert(`${issue.pointer}: ${issue.message}`, "error");
    return Promise.resolve(false);
  }

  return saveDocument(newDocument);
};
// Set once the document is loaded, so the load itself is not autosaved back
useSurveyCreatorAutosave(saveEditedDocument);
</script>

<template>
  <ResourceSurveyCreatorShell />
</template>
