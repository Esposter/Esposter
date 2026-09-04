<script setup lang="ts">
import { useNotificationStore } from "@/store/notification";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { NotificationSeverity } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  surveyId: string;
}

const { surveyId } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingRowKey } = storeToRefs(surveyResponseDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeDeleteMutation } = useMutation();
const { isOpen } = useSingletonDialog(deletingRowKey);
const deleteSurveyResponse = async () => {
  const rowKey = deletingRowKey.value;
  await executeDeleteMutation(() => $trpc.survey.deleteSurveyResponse.mutate({ id: surveyId, rowKey }), {
    key: rowKey,
    onError: createErrorNotification,
    onSuccess: () => {
      createNotification({ severity: NotificationSeverity.Success, title: "Deleted response" });
      emit("delete");
    },
  });
};
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Delete Response' }"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(deleteSurveyResponse, onComplete);
      }
    "
  >
    Are you sure you want to delete this response? Answers are removed permanently.
  </StyledDeleteFormDialog>
</template>
