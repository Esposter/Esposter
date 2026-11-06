<script setup lang="ts">
import type { EditorFinding } from "@/models/editor/EditorFinding";
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { toEmailValidatorFinding } from "@/services/emailEditor/toEmailValidatorFinding";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";

interface Props {
  // The device the canvas's toggle sets: mobile and tablet draw the email at their device's width, and desktop fills the pane
  device: PageBuilderDevice;
  // The open email as the page builder holds it, so Preview shows an edit before it is saved
  emailDocument: EmailDocument;
}

const { device, emailDocument } = defineProps<Props>();
const { $trpc } = useNuxtApp();
// The last html the server compiled. A refused compile keeps it, so the preview still draws the last good message
const html = shallowRef("");
const { data, error, refresh } = useQuery(() => $trpc.email.compile.mutate(emailDocument), {
  isInlineError: true,
  onSuccess: (result) => {
    if ("html" in result) html.value = result.html;
  },
});
const isRefused = computed(() => Boolean(data.value && "messages" in data.value));
// A refused compile's findings are its validator messages, or the refusal itself when the validator names none, since a refused
// Email is an error either way. Exposed for the email's problems surface, which lists them in Design and in Preview alike
const findings = computed<EditorFinding[]>(() => {
  const result = data.value;
  if (!result || !("messages" in result)) return [];

  return result.messages.length > 0
    ? result.messages.map((validatorMessage) => toEmailValidatorFinding(validatorMessage))
    : [{ message: result.message, nodeId: "", severity: EditorFindingSeverity.Error }];
});
// Mobile and tablet match the canvas's width for their device. Desktop fills the pane, where the canvas uses its minimum
const frameWidth = computed(() => (device === PageBuilderDevice.Desktop ? "100%" : `${DEVICE_WIDTH_MAP[device]}px`));
// Each edit schedules one compile on the autosave's cadence, so a run of keystrokes compiles once
const { start: scheduleRefresh } = useTimeoutFn(refresh, RESOURCE_AUTOSAVE_DEBOUNCE_MS, { immediate: false });
watchDeep(
  () => emailDocument,
  () => scheduleRefresh(),
);
defineExpose({ findings });
</script>

<!-- The frame is sandboxed like the published view: scripts run, and the email gets no access to the owner's session -->
<template>
  <div flex flex-col gap-2 h-full min-h-0>
    <UiErrorState v-if="error" :error @retry="refresh()" />
    <iframe
      v-else-if="html"
      b-none
      h-full
      max-w-full
      sandbox="allow-scripts"
      :srcdoc="html"
      :style="{ width: frameWidth }"
      title="Email preview"
    />
    <UiSkeleton v-else-if="!isRefused" h-full w-full />
  </div>
</template>
