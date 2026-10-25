<script setup lang="ts">
import type { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { ACCOUNT_DELETION_MUTATION_KEY } from "@/services/user/constants";
import { AccountDeletionKeptItems } from "@/services/user/settings/AccountDeletionKeptItems";
import { RoutePath } from "@esposter/shared";

interface Props {
  section: UserSettingsPageSection;
}

const { section } = defineProps<Props>();
const { data: session } = await useAuthSession();
const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
const isOpen = ref(false);
// A refused deletion answers false, which keeps the confirmation open with the typed name still in it; the mutation's
// Own toast says why. The sign out waits for the answer, so a deletion that failed leaves the session where it was
const deleteAccount = async () => {
  const outcome = await executeMutation(() => $trpc.user.deleteAccount.mutate(), {
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
