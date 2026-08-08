<script setup lang="ts">
import { AccountLinkErrorMessageMap } from "@/services/auth/AccountLinkErrorMessageMap";
import { authClient } from "@/services/auth/authClient";
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";

const route = useRoute();
const { linkSocial, listAccounts, unlinkAccount } = authClient;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { executeMutation } = useMutation();
const { data: accounts, refresh } = useQuery(() => listAccounts({ fetchOptions: { throw: true } }));
const linkedProviderIds = computed(() => accounts.value?.map(({ providerId }) => providerId) ?? []);
// A link the provider or the callback rejects comes back as a redirect carrying `?error=<code>`, so its
// Outcome never reaches the promise the button awaited
const linkError = route.query.error;
if (typeof linkError === "string")
  createAlert(AccountLinkErrorMessageMap[linkError] ?? "Your account could not be linked.", "error");
</script>

<template>
  <div id="linked-accounts" font-bold mt-12 text-title-large>Linked Accounts</div>
  <div text-body-large>The sign-in providers that reach this account</div>
  <StyledCard mt-6 p-2>
    <v-card-title>
      <div font-bold>Providers</div>
      <v-divider mt-2 />
    </v-card-title>
    <v-list py-6>
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
                linkSocial({
                  callbackURL: RoutePath.UserSettings,
                  errorCallbackURL: RoutePath.UserSettings,
                  fetchOptions: { throw: true },
                  provider: loginButtonProps.provider,
                }),
              { key: loginButtonProps.provider },
            );
          }
        "
        @unlink="
          async () => {
            await executeMutation(
              () => unlinkAccount({ fetchOptions: { throw: true }, providerId: loginButtonProps.provider }),
              {
                key: loginButtonProps.provider,
                onSuccess: async () => {
                  await refresh();
                },
              },
            );
          }
        "
      />
    </v-list>
  </StyledCard>
</template>
