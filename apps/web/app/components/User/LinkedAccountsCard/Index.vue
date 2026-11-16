<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { AccountLinkErrorMessageMap } from "#src/services/auth/AccountLinkErrorMessageMap";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
import { LoginButtonItems } from "#src/services/login/LoginButtonItems";
import { applyOptimisticReplacement } from "#src/services/shared/applyOptimisticReplacement";
import { LINKED_ACCOUNTS_MUTATION_KEY } from "#src/services/user/constants";
import { useAlertStore } from "#src/store/alert";
import { RoutePath } from "@esposter/shared";

interface Props {
  section?: undefined | UserSettingsPageSection;
}

defineProps<Props>();
const router = useRouter();
const { linkSocial, listAccounts, unlinkAccount } = authClient;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { checkIsPending, executeMutation } = useMutation();
const { data: accounts, error, refresh } = useQuery(() => requireAuthData(listAccounts()), { isInlineError: true });
// Keyed by provider because that is what a row knows about itself, valued with the account row's own id
// Because that is what unlinking takes. One provider holds at most one row here: linking keys on the identity
// The provider issued and `allowDifferentEmails` is off, so a second account of the same provider would have to
// Carry the same verified address as the first — which no provider issues twice
const providerIdAccountIdMap = computed(() => new Map(accounts.value?.map(({ id, providerId }) => [providerId, id])));
// The account leaves the list as its unlink is sent, and comes back if the server refuses it
const omitAccount = (accountId: string) =>
  applyOptimisticReplacement(accounts, (previousAccounts) => previousAccounts.filter(({ id }) => id !== accountId));
// A link the provider or the callback rejects comes back as a redirect carrying `?error=<code>`, so its outcome never
// Reaches the write that issued it
const linkError = router.currentRoute.value.query.error;
if (typeof linkError === "string") {
  createAlert(AccountLinkErrorMessageMap[linkError] ?? "Your account could not be linked.", "error");
  // The alert is this outcome's delivery, so the param has done its job — left in the url it replays the toast on
  // Every reload of it. Client-side only: rewriting it during ssr answers the request with a redirect instead
  onMounted(async () => {
    await router.replace({ query: {} });
  });
}
</script>

<template>
  <UserSettingsSection :section>
    <!-- Keyed on the accounts rather than a pending flag: until they land every provider would read "Not linked"
         with a Link button, inviting a user to reconnect a provider they already have, and a refresh mid-unlink
         would blank a list that is still correct -->
    <UiAsyncBody :error :is-pending="accounts ? undefined : true" @retry="refresh()">
      <template #loading>
        <UserSettingsListSkeleton />
      </template>
      <ul flex flex-col>
        <UserLinkedAccountsCardRow
          v-for="loginButtonProps of LoginButtonItems"
          :key="loginButtonProps.provider"
          :="loginButtonProps"
          :is-linked="providerIdAccountIdMap.has(loginButtonProps.provider) ? true : undefined"
          :is-pending="checkIsPending(loginButtonProps.provider) ? true : undefined"
          :linked-account-count="accounts?.length ?? 0"
          @link="
            executeMutation(
              () =>
                requireAuthData(
                  linkSocial({
                    callbackURL: RoutePath.UserSettings,
                    errorCallbackURL: RoutePath.UserSettings,
                    provider: loginButtonProps.provider,
                  }),
                ),
              // The provider's address is minted by the server, and the browser is sent to it once it arrives. Keyed by
              // The provider, so the row that asked is the one that reads pending
              { awaitedBecause: AwaitedReason.ServerIssuedValue, key: loginButtonProps.provider },
            )
          "
          @unlink="
            () => {
              const accountId = providerIdAccountIdMap.get(loginButtonProps.provider);
              if (!accountId) return;
              executeMutation(() => requireAuthData(unlinkAccount({ accountId })), {
                applyOptimistic: () => omitAccount(accountId),
                // Unlinks share one queue, so the server's check that one account is left reads the one before it
                key: LINKED_ACCOUNTS_MUTATION_KEY,
              });
            }
          "
        />
      </ul>
    </UiAsyncBody>
  </UserSettingsSection>
</template>
