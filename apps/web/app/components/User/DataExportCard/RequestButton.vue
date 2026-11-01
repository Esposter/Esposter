<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DATA_EXPORT_MUTATION_KEY } from "@/services/user/constants";

interface Props {
  refresh: () => Promise<unknown>;
}

const { refresh } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { checkIsPending, executeMutation } = useMutation();
</script>

<template>
  <UiButton
    :is-pending="checkIsPending(DATA_EXPORT_MUTATION_KEY)"
    @click="
      executeMutation(() => $trpc.user.requestDataExport.mutate(), {
        key: DATA_EXPORT_MUTATION_KEY,
        onSuccess: async () => {
          await refresh();
        },
      })
    "
  >
    <UiIcon :meaning="UiIconMeaning.Create" />
    Request export
  </UiButton>
</template>
