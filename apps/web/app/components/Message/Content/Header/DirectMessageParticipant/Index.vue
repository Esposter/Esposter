<script setup lang="ts">
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  isOwner: boolean;
  participant: MemberInRoom;
}

defineProps<Props>();
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
