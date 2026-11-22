<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { signOutOfBrowser } from "#src/services/auth/signOutOfBrowser";
import { SESSIONS_MUTATION_KEY } from "#src/services/user/constants";
import { useUserSessionDialogStore } from "#src/store/user/sessionDialog";
import { RoutePath } from "@esposter/shared";

interface Props {
  section: UserSettingsPageSection;
}

defineProps<Props>();
const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
const userSessionDialogStore = useUserSessionDialogStore();
const { revokingId } = storeToRefs(userSessionDialogStore);
const { data: sessions, error, refresh } = useQuery(() => $trpc.session.readSessions.query(), { isInlineError: true });
// Resolved through the primitive rather than a computed of our own, so a target whose session has left the
// Listing — a refresh after another device signed it out — is dropped with it instead of re-opening this dialog
const { item: revokingSession } = useSingletonDialog(revokingId, () =>
  sessions.value?.find(({ id }) => id === revokingId.value),
);
const otherSessionCount = computed(() => sessions.value?.filter(({ isCurrent }) => !isCurrent).length ?? 0);
const sessionRows = computed(() => sessions.value ?? []);
// The sessions stay listed until the server has revoked them, and a refused sign out leaves them listed
const signOutOtherSessions = async () => {
  const outcome = await executeMutation(() => $trpc.session.deleteOtherSessions.mutate(), {
    awaitedBecause: AwaitedReason.ServerDecidedOutcome,
    key: SESSIONS_MUTATION_KEY,
    onSuccess: async () => {
      await refresh();
    },
  });
  return outcome.status === MutationStatus.Succeeded;
};
const revokeSession = async () => {
  const session = revokingSession.value;
  if (!session) return false;

  const { id, isCurrent } = session;
  // Revoking your own session leaves the page authenticated against a session that no longer exists, and only the sign
  // Out clears the cookie and the fetched session, so it signs this browser out. That cannot be taken back, so it waits
  // For the server to keep the revoke, and the row stays listed until then
  const outcome = await executeMutation(() => $trpc.session.deleteSession.mutate(id), {
    awaitedBecause: isCurrent ? AwaitedReason.IrreversibleStep : AwaitedReason.ServerDecidedOutcome,
    key: SESSIONS_MUTATION_KEY,
    onSuccess: async () => {
      if (isCurrent) await signOutOfBrowser(RoutePath.Login);
      else await refresh();
    },
  });
  return outcome.status === MutationStatus.Succeeded;
};
</script>

<template>
  <UserSettingsSection :section>
    <template v-if="otherSessionCount > 0" #actions>
      <UserSessionsCardSignOutOtherSessionsButton :other-session-count :sign-out="signOutOtherSessions" />
    </template>
    <!-- Keyed on the sessions rather than a pending flag: an empty list would read as an account nothing is
         signed in to, while the reader is looking at it from one of the rows it is missing -->
    <UiAsyncBody :error :is-pending="sessions ? undefined : true" @retry="refresh()">
      <template #loading>
        <UserSettingsListSkeleton />
      </template>
      <ul flex flex-col>
        <UserSessionsCardRow
          v-for="{ deviceLabel, id, isCurrent, updatedAt } of sessionRows"
          :key="id"
          :device-label
          :is-current="isCurrent ? true : undefined"
          :updated-at
          @revoke="revokingId = id"
        />
      </ul>
    </UiAsyncBody>
  </UserSettingsSection>
  <UserSessionsCardConfirmRevokeDialog
    v-if="revokingSession"
    :device-label="revokingSession.deviceLabel"
    :is-current="revokingSession.isCurrent ? true : undefined"
    :revoke="revokeSession"
  />
</template>
