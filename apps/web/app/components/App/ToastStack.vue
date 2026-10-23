<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useAlertStore } from "@/store/alert";
import { useClipboardStore } from "@/store/clipboard";

const { data: session } = await useAuthSession();
const alertStore = useAlertStore();
const { alerts } = storeToRefs(alertStore);
const { dismissAlert } = alertStore;
// `copied` is VueUse's readonly ref, lowered by the clipboard itself once its window passes, so that toast needs no
// Timer or dismissal of its own
const clipboardStore = useClipboardStore();
const { copied, text } = storeToRefs(clipboardStore);
// The update waits for the reader rather than reloading under them. Closing it hides it for this page load, and a
// Reload brings it back if the update is still waiting
const { $pwa } = useNuxtApp();
const isUpdateDismissed = ref(false);
</script>

<!-- Every source of a toast, drawn in the one stack: the alerts, what was copied, the notification at the head of its
     queue, and the achievements just unlocked. Each source keeps its own store and its own timing -->
<template>
  <UiToastStack>
    <UiToast
      v-for="alert of alerts"
      :key="alert.id"
      is-dismissible
      :status="alert.type"
      @close="dismissAlert(alert.id)"
    >
      <template v-if="alert.icon" #mark>
        <span :class="alert.icon" :style="{ color: `var(--ui-${alert.type})` }" aria-hidden="true" size-6 />
      </template>
      {{ alert.text }}
    </UiToast>
    <UiToast v-if="copied" status="success">
      Copied <code text-info>{{ text }}</code>
    </UiToast>
    <UiToast
      v-if="$pwa?.needRefresh && !isUpdateDismissed"
      is-dismissible
      status="info"
      @close="isUpdateDismissed = true"
    >
      A new version is ready.
      <template #actions>
        <UiButton :variant="UiButtonVariant.Accent" @click="$pwa?.updateServiceWorker(true)">Reload</UiButton>
      </template>
    </UiToast>
    <AppNotificationToast v-if="session" />
    <AchievementNotificationToastList v-if="session" />
  </UiToastStack>
</template>
