<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { useNotificationStore } from "#src/store/notification";
import { useSurveyResponseDialogStore } from "#src/store/resource/surveyResponseDialog";
import { NotificationSeverity } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

interface Props {
  surveyId: string;
}

const { surveyId } = defineProps<Props>();
// The row leaves the table once the server has deleted the response, and the table is read again then. That read runs on
// The table's run scope, so a read that was in flight before the delete cannot put the response back
const emit = defineEmits<{ delete: [responseId: string]; refresh: [] }>();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingResponseId } = storeToRefs(surveyResponseDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { isOpen } = useSingletonDialog(deletingResponseId);
const deleteResponse = (responseId: string) =>
  getResultAsync(() => $trpc.survey.deleteSurveyResponse.mutate({ id: surveyId, responseId })).match(
    () => {
      createNotification({ severity: NotificationSeverity.Success, title: "Deleted response" });
      emit("delete", responseId);
      emit("refresh");
    },
    (error) => {
      createErrorNotification(error);
      return false;
    },
  );
</script>

<template>
  <UiConfirmDialog
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerDecidedOutcome"
    confirm-label="Delete"
    title="Delete response"
    :confirm="() => deleteResponse(deletingResponseId)"
  >
    <p>Delete this response? Its answers are removed for good.</p>
  </UiConfirmDialog>
</template>
