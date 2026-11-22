<script setup lang="ts">
import type { LoginButtonProps } from "#src/models/auth/LoginButtonProps";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { authClient } from "#src/services/auth/authClient";
import { requireAuthData } from "#src/services/auth/requireAuthData";
import { toTitleCase } from "#src/util/text/toTitleCase";
import { RoutePath } from "@esposter/shared";

interface Props extends LoginButtonProps {
  isLinked?: true | undefined;
  linkedAccountCount: number;
}

const { provider } = defineProps<Props>();
const emit = defineEmits<{ unlink: [] }>();
const { linkSocial } = authClient;
const { checkIsPending, executeMutation } = useMutation();
// The provider's address is minted by the server, and the browser is sent to it once it arrives.
// Keyed by the provider, so the row that asked is the one that reads pending
const link = () =>
  executeMutation(
    () =>
      requireAuthData(
        linkSocial({ callbackURL: RoutePath.UserSettings, errorCallbackURL: RoutePath.UserSettings, provider }),
      ),
    { awaitedBecause: AwaitedReason.ServerIssuedValue, key: provider },
  );
</script>

<template>
  <li ui-row>
    <UiItemContent
      :description="
        !isLinked ? 'Not linked' : linkedAccountCount === 1 ? 'Linked — your only way back into this account' : 'Linked'
      "
      :title="toTitleCase(provider)"
    >
      <template #mark>
        <component :is="logo" size-6 fill-current />
      </template>
    </UiItemContent>
    <UiButton
      v-if="isLinked"
      :disabled="linkedAccountCount === 1"
      :is-pending="checkIsPending(provider) ? true : undefined"
      :variant="UiButtonVariant.Danger"
      @click="emit('unlink')"
    >
      Unlink
    </UiButton>
    <UiButton v-else :is-pending="checkIsPending(provider) ? true : undefined" @click="link()">Link</UiButton>
  </li>
</template>
