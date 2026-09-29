<script setup lang="ts">
import type { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { requireAuthData } from "@/services/auth/requireAuthData";
import { API_KEYS_MUTATION_KEY } from "@/services/user/constants";
import { useUserApiKeyDialogStore } from "@/store/user/apiKeyDialog";

interface Props {
  section: UserSettingsPageSection;
}

const { section } = defineProps<Props>();
const {
  apiKey: { create, delete: deleteApiKey, list },
} = authClient;
const { executeMutation } = useMutation();
const userApiKeyDialogStore = useUserApiKeyDialogStore();
const { deletingId } = storeToRefs(userApiKeyDialogStore);
const { data, error, refresh } = useQuery(() => requireAuthData(list()), { isInlineError: true });
// Resolved through the primitive, so a key another device deleted is dropped with its row rather than re-opening
const { item: deletingApiKey } = useSingletonDialog(deletingId, () =>
  data.value?.apiKeys.find(({ id }) => id === deletingId.value),
);
</script>

<template>
  <UserSettingsSection :section>
    <template #actions>
      <UserApiKeysCardCreateButton
        :create="
          async (name) => {
            const outcome = await executeMutation(() => requireAuthData(create({ name })), {
              key: API_KEYS_MUTATION_KEY,
              onSuccess: async () => {
                await refresh();
              },
            });
            return outcome.status === MutationStatus.Succeeded ? (outcome.result?.key ?? '') : '';
          }
        "
      />
    </template>
    <UiErrorState v-if="error" :error @retry="refresh()" />
    <UserSettingsListSkeleton v-else-if="!data" />
    <UiEmptyState
      v-else-if="data.apiKeys.length === 0"
      description="An agent such as a Claude Code session reaches your TodoList with one"
      :meaning="UiIconMeaning.Terminal"
      title="No API keys"
    />
    <ul v-else flex flex-col>
      <UserApiKeysCardRow
        v-for="{ createdAt, id, name, start } of data.apiKeys"
        :key="id"
        :created-at
        :name="name ?? ''"
        :start="start ?? ''"
        @delete="deletingId = id"
      />
    </ul>
  </UserSettingsSection>
  <UserApiKeysCardConfirmDeleteDialog
    v-if="deletingApiKey"
    :delete-key="
      () => {
        if (!deletingApiKey) return;
        const { id } = deletingApiKey;
        return executeMutation(() => requireAuthData(deleteApiKey({ keyId: id })), {
          key: API_KEYS_MUTATION_KEY,
          onSuccess: async () => {
            await refresh();
          },
        });
      }
    "
    :name="deletingApiKey.name ?? ''"
  />
</template>
