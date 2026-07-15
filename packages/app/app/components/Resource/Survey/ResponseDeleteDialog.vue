<script setup lang="ts">
import { useNotificationStore } from "@/store/notification";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { withFinalizerAsync } from "@esposter/shared";

interface ResourceSurveyResponseDeleteDialogProps {
  surveyId: string;
}

const { surveyId } = defineProps<ResourceSurveyResponseDeleteDialogProps>();
const emit = defineEmits<{ delete: [] }>();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingRowKey } = storeToRefs(surveyResponseDialogStore);
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const executeDeleteMutation = useMutation();
const isOpen = useSingletonDialog(deletingRowKey);
const deleteSurveyResponse = async () => {
  const rowKey = deletingRowKey.value;
  await executeDeleteMutation(() => $trpc.survey.deleteSurveyResponse.mutate({ id: surveyId, rowKey }), {
    onError: (error) => {
      createNotification({ severity: "error", title: error.message });
    },
    onSuccess: () => {
      createNotification({ severity: "success", title: "Deleted response" });
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
