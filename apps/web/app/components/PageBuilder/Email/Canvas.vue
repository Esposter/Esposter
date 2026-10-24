<script setup lang="ts">
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DESKTOP_MIN_WIDTH, DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { renderEmailCanvasVNodes } from "@/services/pageBuilder/email/renderEmailCanvasVNodes";
import { emailKind } from "@/services/pageBuilder/emailKind";

interface Props {
  device: PageBuilderDevice;
  email: EmailDocument;
}

// The width the frame draws at, which the stacking of the columns is checked against
const { device, email } = defineProps<Props>();
const width = computed(() => (device === PageBuilderDevice.Desktop ? DESKTOP_MIN_WIDTH : DEVICE_WIDTH_MAP[device]));
// The nodes are drawn by the frame's content, so the render is a functional component over the email it draws
const EmailNodes = () => renderEmailCanvasVNodes(emailKind, email, width.value);
</script>

<template>
  <PageBuilderCanvasFrame css="" :device title="Email">
    <div :style="{ margin: '0 auto', maxWidth: '600px' }">
      <EmailNodes />
    </div>
  </PageBuilderCanvasFrame>
</template>
