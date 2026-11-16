<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { DATA_EXPORT_MUTATION_KEY } from "#src/services/user/constants";

interface Props {
  refresh: () => Promise<unknown>;
}

defineProps<Props>();
const { $trpc } = useNuxtApp();
const { checkIsPending, executeMutation } = useMutation();
</script>

<template>
  <UiButton
    :is-pending="checkIsPending(DATA_EXPORT_MUTATION_KEY)"
    @click="
      executeMutation(() => $trpc.user.requestDataExport.mutate(), {
        // The export's row and its status are the server's, so the card waits for them before it reads them back
        awaitedBecause: AwaitedReason.ServerIssuedValue,
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
