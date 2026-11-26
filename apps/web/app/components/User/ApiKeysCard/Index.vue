<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { getApiKeyScopes } from "#shared/services/auth/getApiKeyScopes";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
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
const { data: apiKeyList, error, refresh } = useQuery(() => requireAuthData(list()), { isInlineError: true });
const apiKeys = computed(() => apiKeyList.value?.apiKeys ?? []);
const emptyState = {
  description: "An agent such as a Claude Code session reaches your follow-ups or your resources with one",
  meaning: UiIconMeaning.Terminal,
  title: "No API keys",
};
// Resolved through the primitive, so a key another device deleted is dropped with its row rather than re-opening
const { item: deletingApiKey } = useSingletonDialog(deletingId, () =>
  apiKeyList.value?.apiKeys.find(({ id }) => id === deletingId.value),
);
// The key stays listed until the server has deleted it, and a refused delete leaves it listed
const deleteKey = async () => {
  const apiKey = deletingApiKey.value;
  if (!apiKey) return false;

  const outcome = await executeMutation(() => requireAuthData(deleteApiKey({ keyId: apiKey.id })), {
    awaitedBecause: AwaitedReason.ServerDecidedOutcome,
    key: API_KEYS_MUTATION_KEY,
    onSuccess: async () => {
      await refresh();
    },
  });
  return outcome.status === MutationStatus.Succeeded;
};
</script>

<template>
  <UserSettingsSection :section>
    <template #actions>
      <UserApiKeysCardCreateButton
        :create="async (input) => {
          const outcome = await executeMutation(() => $trpc.user.createApiKey.mutate(input), {
            // The key is minted by the server and shown once, so the dialog waits for it before it draws it
            awaitedBecause: AwaitedReason.ServerIssuedValue,
            key: API_KEYS_MUTATION_KEY,
            onSuccess: async () => {
              await refresh();
            },
          });
          return outcome.status === MutationStatus.Succeeded ? (outcome.result ?? '') : '';
        }"
      />
    </template>
    <UiAsyncBody
      :empty-state
      :error
      :is-empty="apiKeys.length === 0 ? true : undefined"
      :is-pending="apiKeyList ? undefined : true"
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
  <UserApiKeysCardConfirmDeleteDialog v-if="deletingApiKey" :delete-key :name="deletingApiKey.name ?? ''" />
</template>
