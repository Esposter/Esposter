<script setup lang="ts">
import { AccountLinkErrorMessageMap } from "@/services/auth/AccountLinkErrorMessageMap";
import { authClient } from "@/services/auth/authClient";
import { requireAuthData } from "@/services/auth/requireAuthData";
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";

// One key for every row, because they all write one target: the account set. better-auth's last-account guard
// Reads the accounts and deletes without a transaction, so two unlinks in flight together both see two providers,
// Both pass, and both delete — leaving an account no provider reaches, which sign-in here can never recover
const LINKED_ACCOUNTS_KEY = "linkedAccounts";

const { currentRoute } = useRouter();
const router = useRouter();
const { linkSocial, listAccounts, unlinkAccount } = authClient;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { executeMutation } = useMutation();
const { data: accounts, refresh } = useQuery(() => requireAuthData(listAccounts()));
const linkedProviderIds = computed(() => accounts.value?.map(({ providerId }) => providerId) ?? []);
// A link the provider or the callback rejects comes back as a redirect carrying `?error=<code>`, so its
// Outcome never reaches the promise the button awaited
const linkError = currentRoute.value.query.error;
if (typeof linkError === "string") {
  createAlert(AccountLinkErrorMessageMap[linkError] ?? "Your account could not be linked.", "error");
  // The alert is this outcome's delivery, so the param has done its job — left in the url it replays the toast on
  // Every reload of it. Client-side only: rewriting it during ssr answers the request with a redirect instead
  onMounted(() => {
    router.replace({ query: {} });
  });
}
</script>

<template>
  <div id="linked-accounts" font-bold mt-12 text-title-large>Linked Accounts</div>
  <div text-body-large>The sign-in providers that reach this account</div>
  <StyledCard mt-6 p-2>
    <v-card-title>
      <div font-bold>Providers</div>
      <v-divider mt-2 />
    </v-card-title>
    <!-- Keyed on the accounts rather than a pending flag: until they land every provider would read "Not linked"
         with a Link button, inviting a user to reconnect a provider they already have, and a refresh mid-unlink
         would blank a list that is still correct -->
    <StyledSkeleton v-if="!accounts" type="list-item-avatar@3" />
    <v-list v-else py-6>
      <UserLinkedAccountsCardRow
        v-for="loginButtonProps of LoginButtonItems"
        :key="loginButtonProps.provider"
        :="loginButtonProps"
        :is-linked="linkedProviderIds.includes(loginButtonProps.provider) ? true : undefined"
        :linked-account-count="linkedProviderIds.length"
        @link="
          async () => {
            await executeMutation(
              () =>
                requireAuthData(
                  linkSocial({
                    callbackURL: RoutePath.UserSettings,
                    errorCallbackURL: RoutePath.UserSettings,
                    provider: loginButtonProps.provider,
                  }),
                ),
              { key: LINKED_ACCOUNTS_KEY },
            );
          }
        "
        @unlink="
          async () => {
            await executeMutation(() => requireAuthData(unlinkAccount({ providerId: loginButtonProps.provider })), {
              key: LINKED_ACCOUNTS_KEY,
              onSuccess: async () => {
                await refresh();
              },
            });
          }
        "
      />
    </v-list>
  </StyledCard>
</template>
