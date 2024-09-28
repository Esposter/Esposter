import type { RecursiveDeepOmitItemMetadata } from "@/util/types/RecursiveDeepOmitItemMetadata";

import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";
import { omitDeepItemMetadata } from "@/services/shared/omitDeepItemMetadata";
import { useEmailEditorStore } from "@/store/emailEditor";
import { jsonDateParse } from "@/util/time/jsonDateParse";
import deepEqual from "fast-deep-equal";

export const useReadEmailEditor = async () => {
  const { $client } = useNuxtApp();
  const emailEditorStore = useEmailEditorStore();
  const { saveEmailEditor } = emailEditorStore;
  const { emailEditor } = storeToRefs(emailEditorStore);
  const emailEditorChangedTracker = computed<RecursiveDeepOmitItemMetadata<EmailEditor>>(
    (oldEmailEditorChangedTracker) => {
      const newEmailEditorChangedTracker = omitDeepItemMetadata(emailEditor.value);
      return oldEmailEditorChangedTracker && deepEqual(newEmailEditorChangedTracker, oldEmailEditorChangedTracker)
        ? oldEmailEditorChangedTracker
        : newEmailEditorChangedTracker;
    },
  );
  await useReadData(
    () => {
      const emailEditorJson = localStorage.getItem(EMAIL_EDITOR_LOCAL_STORAGE_KEY);
      if (emailEditorJson) emailEditor.value = Object.assign(new EmailEditor(), jsonDateParse(emailEditorJson));
      else emailEditor.value = new EmailEditor();
    },
    async () => {
      emailEditor.value = await $client.emailEditor.readEmailEditor.query();
    },
  );

  watchTracker(emailEditorChangedTracker, async () => {
    await saveEmailEditor();
  });
};
