<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { DATA_EXPORT_MUTATION_KEY } from "#src/services/user/constants";

interface Props {
  dataExportId: string;
}

defineProps<Props>();
const { $trpc } = useNuxtApp();
const { checkIsPending, executeMutation } = useMutation();
// Held by the button rather than the card, so the link is dropped with the ready export it was minted for
const link = ref("");
</script>

<template>
  <UiButton
    :is-pending="checkIsPending(DATA_EXPORT_MUTATION_KEY)"
    @click="
      executeMutation(() => $trpc.user.generateDataExportLink.mutate(dataExportId), {
        // The download address is signed by the server, so the button waits for it before it draws the link
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key: DATA_EXPORT_MUTATION_KEY,
        onSuccess: (url) => {
          link = url;
        },
      })
    "
  >
    <UiIcon :meaning="UiIconMeaning.Link" />
    Get download link
  </UiButton>
  <UiButtonLink v-if="link" :to="link">
    <UiIcon :meaning="UiIconMeaning.Download" />
    Download archive
  </UiButtonLink>
</template>
