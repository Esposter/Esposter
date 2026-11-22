<script setup lang="ts">
import type { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { AccountLinkErrorMessageMap } from "#src/services/auth/AccountLinkErrorMessageMap";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
import { LoginButtonItems } from "#src/services/login/LoginButtonItems";
import { LINKED_ACCOUNTS_MUTATION_KEY } from "#src/services/user/constants";
import { useAlertStore } from "#src/store/alert";
import { useUserLinkedAccountDialogStore } from "#src/store/user/linkedAccountDialog";
import { getOwnValue, RoutePath } from "@esposter/shared";

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
const userLinkedAccountDialogStore = useUserLinkedAccountDialogStore();
const { unlinkingProvider } = storeToRefs(userLinkedAccountDialogStore);
// Resolved through the primitive rather than a computed of our own, so a target whose account has left the listing
// — a refresh after another device unlinked it — is dropped with it instead of re-opening this dialog
const { item: unlinkingAccount } = useSingletonDialog(unlinkingProvider, () =>
  accounts.value?.find(({ providerId }) => providerId === unlinkingProvider.value),
);
// Keyed by provider because that is what a row knows about itself. One provider holds at most one row here: linking
// Keys on the identity the provider issued and `allowDifferentEmails` is off, so a second account of the same provider
// Would have to carry the same verified address as the first — which no provider issues twice
const linkedProviders = computed(() => new Set(accounts.value?.map(({ providerId }) => providerId)));
// Read as the confirm is answered rather than as the button was pressed, so the account it unlinks is the one listed then.
// The account stays listed until the server has unlinked it, and a refused unlink leaves it listed
const unlinkSelectedAccount = async () => {
  const account = unlinkingAccount.value;
  if (!account) return false;

  const { id } = account;
  const outcome = await executeMutation(() => requireAuthData(unlinkAccount({ accountId: id })), {
    awaitedBecause: AwaitedReason.ServerDecidedOutcome,
    // Unlinks share one queue, so the server's check that one account is left reads the one before it
    key: LINKED_ACCOUNTS_MUTATION_KEY,
    onSuccess: async () => {
      await refresh();
    },
  });
  return outcome.status === MutationStatus.Succeeded;
};
// A link the provider or the callback rejects comes back as a redirect carrying `?error=<code>`, so its outcome never
// Reaches the write that issued it
const linkError = router.currentRoute.value.query.error;
if (typeof linkError === "string") {
  createAlert(getOwnValue(AccountLinkErrorMessageMap, linkError) ?? "Your account could not be linked.", "error");
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
          :is-linked="linkedProviders.has(loginButtonProps.provider) ? true : undefined"
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
          @unlink="unlinkingProvider = loginButtonProps.provider"
        />
      </ul>
    </UiAsyncBody>
  </UserSettingsSection>
  <UserLinkedAccountsCardConfirmUnlinkDialog
    v-if="unlinkingAccount"
    :provider="unlinkingAccount.providerId"
    :unlink="unlinkSelectedAccount"
  />
</template>
