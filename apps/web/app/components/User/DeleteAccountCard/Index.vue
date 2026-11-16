<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { signOutOfBrowser } from "#src/services/auth/signOutOfBrowser";
import { ACCOUNT_DELETION_MUTATION_KEY } from "#src/services/user/constants";
import { AccountDeletionKeptItems } from "#src/services/user/settings/AccountDeletionKeptItems";
import { RoutePath } from "@esposter/shared";

interface Props {
  section: UserSettingsPageSection;
}

defineProps<Props>();
const { data: session } = await useAuthSession();
const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
const isOpen = ref(false);
// The sign out is the step that cannot be taken back, so the confirmation waits for the server to keep the deletion. A
// Refused one leaves the session where it was and the dialog open on the typed name, and the mutation's alert says why
const deleteAccount = async () => {
  const outcome = await executeMutation(() => $trpc.user.deleteAccount.mutate(), {
    awaitedBecause: AwaitedReason.IrreversibleStep,
    key: ACCOUNT_DELETION_MUTATION_KEY,
    onSuccess: () => signOutOfBrowser(RoutePath.Login),
  });
  return outcome.status === MutationStatus.Succeeded;
};
</script>

<template>
  <UserSettingsSection :section>
    <template #actions>
      <UiButton aria-haspopup="dialog" :variant="UiButtonVariant.Danger" @click="isOpen = true">
        Delete account
      </UiButton>
    </template>
  </UserSettingsSection>
  <UiConfirmDialog
    v-if="session"
    v-model="isOpen"
    confirm-label="Delete account"
    :awaited-because="AwaitedReason.IrreversibleStep"
    :confirm="deleteAccount"
    :confirm-name="session.user.name"
    title="Delete account"
  >
    <p>
      Deleting your account signs you out everywhere, then removes your rooms and resources, your messages in the rooms
      you are still in, your files and your saves. The removal runs in the background and cannot be undone.
    </p>
    <p>These are kept:</p>
    <ul flex flex-col>
      <li v-for="{ meaning, title } of AccountDeletionKeptItems" :key="title" ui-row>
        <UiItemContent :meaning :title />
      </li>
    </ul>
  </UiConfirmDialog>
</template>
