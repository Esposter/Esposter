<script setup lang="ts">
import { useNotificationStore } from "@/store/notification";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { NotificationSeverity } from "@esposter/db-schema";

interface Props {
  surveyId: string;
}

const { surveyId } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingResponseId } = storeToRefs(surveyResponseDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeDeleteMutation } = useMutation();
const { isOpen } = useSingletonDialog(deletingResponseId);
const deleteSurveyResponse = async () => {
  const responseId = deletingResponseId.value;
  await executeDeleteMutation(() => $trpc.survey.deleteSurveyResponse.mutate({ id: surveyId, responseId }), {
    key: responseId,
    onError: createErrorNotification,
    onSuccess: () => {
      createNotification({ severity: NotificationSeverity.Success, title: "Deleted response" });
      emit("delete");
    },
  });
};
</script>

<template>
  <UiConfirmDialog v-model="isOpen" confirm-label="Delete" title="Delete response" :confirm="deleteSurveyResponse">
    <p>Delete this response? Its answers are removed for good.</p>
  </UiConfirmDialog>
</template>
