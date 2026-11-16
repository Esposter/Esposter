<script setup lang="ts">
import { useNotificationStore } from "#src/store/notification";
import { useSurveyResponseDialogStore } from "#src/store/resource/surveyResponseDialog";
import { NotificationSeverity } from "@esposter/db-schema";

interface Props {
  surveyId: string;
}

const { surveyId } = defineProps<Props>();
// The response leaves the table as its delete is sent. The table is read again once the delete settles either way: the
// Summary counts are the server's, and a refused delete comes back with the read
const emit = defineEmits<{ delete: [responseId: string]; refresh: [] }>();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingResponseId } = storeToRefs(surveyResponseDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification, dismissNotification } = notificationStore;
const { executeMutation: executeDeleteMutation } = useMutation();
const { isOpen } = useSingletonDialog(deletingResponseId);
const deleteSurveyResponse = () => {
  const responseId = deletingResponseId.value;
  executeDeleteMutation(() => $trpc.survey.deleteSurveyResponse.mutate({ id: surveyId, responseId }), {
    applyOptimistic: () => {
      const notificationId = createNotification({ severity: NotificationSeverity.Success, title: "Deleted response" });
      emit("delete", responseId);
      return () => {
        dismissNotification(notificationId);
        emit("refresh");
      };
    },
    key: responseId,
    onError: createErrorNotification,
    reconcile: () => {
      emit("refresh");
    },
  });
};
</script>

<template>
  <UiConfirmDialog v-model="isOpen" confirm-label="Delete" title="Delete response" :confirm="deleteSurveyResponse">
    <p>Delete this response? Its answers are removed for good.</p>
  </UiConfirmDialog>
</template>
