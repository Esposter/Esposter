<script setup lang="ts">
import type { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DATA_EXPORT_MUTATION_KEY } from "@/services/user/constants";
import { DataExportOmittedItems } from "@/services/user/settings/DataExportOmittedItems";
import { DataExportStatus } from "@esposter/db-schema";

interface Props {
  section: UserSettingsPageSection;
}

const { section } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { checkIsPending, executeMutation } = useMutation();
const {
  data: dataExport,
  error,
  isPending: isReading,
  refresh,
} = useQuery(() => $trpc.user.readDataExport.query(), { isInlineError: true });
const isInFlight = computed(
  () => dataExport.value?.status === DataExportStatus.Queued || dataExport.value?.status === DataExportStatus.Building,
);
// The check the server makes before it signs a link, so a ready export past its expiry offers none
const isDownloadable = computed(
  () =>
    dataExport.value?.status === DataExportStatus.Ready &&
    dataExport.value.expiresAt !== null &&
    dataExport.value.expiresAt > new Date(),
);
</script>

<template>
  <UserSettingsSection :section>
    <template #actions>
      <UiButton
        v-if="!isInFlight && !isDownloadable"
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
    <p text-muted>The archive holds your own data, and leaves out:</p>
    <ul flex flex-col>
      <li v-for="{ meaning, title } of DataExportOmittedItems" :key="title" ui-row>
        <UiItemContent :meaning :title />
      </li>
    </ul>
    <UiErrorState v-if="error" :error @retry="refresh()" />
    <UserSettingsListSkeleton v-else-if="isReading && !dataExport" />
    <p v-else-if="!dataExport" text-muted>Request the archive to have it built in the background.</p>
    <template v-else-if="isInFlight">
      <p>
        {{ dataExport.status === DataExportStatus.Queued ? "Queued, waiting to be built." : "Building the archive." }}
      </p>
      <UiButton :is-pending="isReading" @click="refresh()">
        <UiIcon :meaning="UiIconMeaning.Refresh" />
        Check status
      </UiButton>
    </template>
    <p v-else-if="dataExport.status === DataExportStatus.Failed" text-muted>
      The build failed. Request the archive again to start a new one.
    </p>
    <template v-else-if="isDownloadable">
      <p>Ready. Download it before it expires.</p>
      <UserDataExportCardLink :data-export-id="dataExport.id" />
    </template>
    <p v-else text-muted>This archive has expired. Request a new one.</p>
  </UserSettingsSection>
</template>
