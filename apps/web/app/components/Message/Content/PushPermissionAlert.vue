<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiToken } from "#src/models/ui/UiToken";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

const notificationPermission = usePermission("notifications");
const isPushSupported = useSupported(() => "Notification" in window && "PushManager" in window);
const isDismissed = useLocalStorage(LocalStorageKey.PushPermissionAlertDismissed, false);
// The permission state above takes the answer through its change event, so nothing waits on the prompt here
const requestPermission = () => window.Notification.requestPermission();
</script>

<!-- A browser asks for the permission only from a press, so the ask is a line of its own until it is answered or
     closed, as Discord's bar over the app is. Granting it is what subscribes this device (`usePushSubscription`) -->
<template>
  <UiAlert v-if="isPushSupported && notificationPermission === 'prompt' && !isDismissed" :status="UiToken.Info" m-2>
    <div flex flex-wrap gap-2 items-center>
      <span flex-1>Turn on desktop notifications to hear about new messages while you are away.</span>
      <UiButton @click="requestPermission()">Enable</UiButton>
      <UiIconButton
        label="Dismiss"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="isDismissed = true"
      />
    </div>
  </UiAlert>
</template>
