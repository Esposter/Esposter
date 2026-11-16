<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { getApiKeyScopes } from "#shared/services/auth/getApiKeyScopes";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
import { applyOptimisticReplacement } from "#src/services/shared/applyOptimisticReplacement";
import { API_KEYS_MUTATION_KEY } from "#src/services/user/constants";
import { useUserApiKeyDialogStore } from "#src/store/user/apiKeyDialog";

interface Props {
  section: UserSettingsPageSection;
}

defineProps<Props>();
const {
  apiKey: { delete: deleteApiKey, list },
} = authClient;
const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
const userApiKeyDialogStore = useUserApiKeyDialogStore();
const { deletingId } = storeToRefs(userApiKeyDialogStore);
const { data, error, refresh } = useQuery(() => requireAuthData(list()), { isInlineError: true });
const apiKeys = computed(() => data.value?.apiKeys ?? []);
// The key leaves the list as its delete is sent, and comes back if the server refuses it
const removeApiKey = (id: string) =>
  applyOptimisticReplacement(data, (previousData) => ({
    ...previousData,
    apiKeys: previousData.apiKeys.filter((apiKey) => apiKey.id !== id),
  }));
const emptyState = {
  description: "An agent such as a Claude Code session reaches your follow-ups or your resources with one",
  meaning: UiIconMeaning.Terminal,
  title: "No API keys",
};
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
          async (input) => {
            const outcome = await executeMutation(() => $trpc.user.createApiKey.mutate(input), {
              // The key is minted by the server and shown once, so the dialog waits for it before it draws it
              awaitedBecause: AwaitedReason.ServerIssuedValue,
              key: API_KEYS_MUTATION_KEY,
              onSuccess: async () => {
                await refresh();
              },
            });
            return outcome.status === MutationStatus.Succeeded ? (outcome.result ?? '') : '';
          }
        "
      />
    </template>
    <UiAsyncBody
      :empty-state
      :error
      :is-empty="apiKeys.length === 0 ? true : undefined"
      :is-pending="data ? undefined : true"
      @retry="refresh()"
    >
      <template #loading>
        <UserSettingsListSkeleton />
      </template>
      <ul flex flex-col>
        <UserApiKeysCardRow
          v-for="{ createdAt, id, name, permissions, start } of apiKeys"
          :key="id"
          :created-at
          :mcp-scopes="getApiKeyScopes(permissions)"
          :name="name ?? ''"
          :start="start ?? ''"
          @delete="deletingId = id"
        />
      </ul>
    </UiAsyncBody>
  </UserSettingsSection>
  <UserApiKeysCardConfirmDeleteDialog
    v-if="deletingApiKey"
    :delete-key="
      () => {
        if (!deletingApiKey) return;
        const { id } = deletingApiKey;
        executeMutation(() => requireAuthData(deleteApiKey({ keyId: id })), {
          applyOptimistic: () => removeApiKey(id),
          key: API_KEYS_MUTATION_KEY,
        });
      }
    "
    :name="deletingApiKey.name ?? ''"
  />
</template>
