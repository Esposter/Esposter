<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  deviceLabel: string;
  isCurrent?: true;
  updatedAt: Date;
}

const { deviceLabel, isCurrent, updatedAt } = defineProps<Props>();
const emit = defineEmits<{ revoke: [] }>();
</script>

<template>
  <li flex gap-4 items-center>
    <UiIcon :meaning="UiIconMeaning.Device" :class="isCurrent ? 'text-accent' : 'text-muted'" />
    <!-- The browser, the platform and how recently it was used are the whole basis for deciding whether this row is
         someone else, so both lines wrap rather than being cut short on a narrow screen -->
    <div flex flex-1 flex-col min-w-0>
      <span break-anywhere>{{ deviceLabel }}</span>
      <span text-muted>
        <template v-if="isCurrent">This device · </template>
        last active <NuxtTime :datetime="updatedAt" relative />
      </span>
    </div>
    <!-- The current row signs this browser out rather than revoking a session the reader is still using, so the
         wording says which one it is before the click rather than after -->
    <UiButton :variant="UiButtonVariant.Danger" py-1 @click="emit('revoke')">
      {{ isCurrent ? "Sign out" : "Revoke" }}
    </UiButton>
  </li>
</template>
