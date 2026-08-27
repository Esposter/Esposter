<script setup lang="ts">
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { useUserSessionDialogStore } from "@/store/user/sessionDialog";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

// One key for every row, because they all write one target: the session set. Each revoke refreshes the listing
// The card renders, so two in flight together would both read a list the other has already changed
const SESSIONS_KEY = "sessions";

const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
const userSessionDialogStore = useUserSessionDialogStore();
const { revokingId } = storeToRefs(userSessionDialogStore);
const { data: sessions, refresh } = useQuery(() => $trpc.session.readSessions.query());
// Resolved through the primitive rather than a computed of our own, so a target whose session has left the
// Listing — a refresh after another device signed it out — is dropped with it instead of re-opening this dialog
const { item: revokingSession } = useSingletonDialog(revokingId, () =>
  sessions.value?.find(({ id }) => id === revokingId.value),
);
const otherSessionCount = computed(() => sessions.value?.filter(({ isCurrent }) => !isCurrent).length ?? 0);
</script>

<template>
  <div id="sessions" font-bold mt-12 text-title-large>Sessions</div>
  <div text-body-large>The devices signed in to this account</div>
  <StyledCard mt-6 p-2>
    <v-card-title>
      <div font-bold>Active sessions</div>
      <v-divider mt-2 />
    </v-card-title>
    <!-- Keyed on the sessions rather than a pending flag: an empty list would read as an account nothing is
         signed in to, while the reader is looking at it from one of the rows it is missing -->
    <StyledSkeleton v-if="!sessions" type="list-item-avatar@3" />
    <template v-else>
      <v-list py-6>
        <UserSessionsCardRow
          v-for="{ deviceLabel, id, isCurrent, updatedAt } of sessions"
          :key="id"
          :device-label
          :is-current="isCurrent ? true : undefined"
          :updated-at
          @revoke="revokingId = id"
        />
      </v-list>
      <v-card-actions v-if="otherSessionCount > 0">
        <v-spacer />
        <UserSessionsCardSignOutOtherSessionsButton
          :other-session-count
          @sign-out="
            async (onComplete) => {
              await withFinalizerAsync(
                () =>
                  executeMutation(() => $trpc.session.deleteOtherSessions.mutate(), {
                    key: SESSIONS_KEY,
                    onSuccess: async () => {
                      await refresh();
                    },
                  }),
                onComplete,
              );
            }
          "
        />
      </v-card-actions>
    </template>
  </StyledCard>
  <UserSessionsCardConfirmRevokeDialog
    v-if="revokingSession"
    :device-label="revokingSession.deviceLabel"
    :is-current="revokingSession.isCurrent ? true : undefined"
    @revoke="
      async (onComplete) => {
        if (!revokingSession) return;
        const { id, isCurrent } = revokingSession;
        await withFinalizerAsync(
          () =>
            executeMutation(() => $trpc.session.deleteSession.mutate(id), {
              key: SESSIONS_KEY,
              onSuccess: async () => {
                // Revoking your own session leaves the page authenticated against a session that no longer
                // Exists, so it signs this browser out on the way to the login route instead of refreshing a
                // Listing it cannot read — the revoke deleted the row, and only the sign out clears the cookie
                // And the fetched session that would otherwise go on rendering a signed-in account
                if (isCurrent) await signOutOfBrowser(RoutePath.Login);
                else await refresh();
              },
            }),
          onComplete,
        );
      }
    "
  />
</template>
