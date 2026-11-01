<script setup lang="ts">
import type { DirectMessageParticipant } from "#shared/models/db/room/DirectMessageParticipants";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isOwner: boolean;
  participant: DirectMessageParticipant;
}

const { isOwner, participant } = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <div ui-row>
    <UiItemContent :image="participant.image" :title="participant.name">
      <template v-if="isOwner" #append>
        <UiIconButton
          :label="`Remove ${participant.name}`"
          :meaning="UiIconMeaning.Remove"
          :variant="UiButtonVariant.Quiet"
          @click="emit('remove')"
        />
      </template>
    </UiItemContent>
  </div>
</template>
