<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useDirectMessageStore } from "@/store/message/room/directMessage";

const directMessageStore = useDirectMessageStore();
const { currentDirectMessage } = storeToRefs(directMessageStore);
const { deleteDirectMessageParticipant, getDirectMessageParticipants } = directMessageStore;
const directMessageName = useDirectMessageName(currentDirectMessage);
const participants = computed(() =>
  currentDirectMessage.value ? getDirectMessageParticipants(currentDirectMessage.value.id) : [],
);
</script>

<!-- A direct message's name on one line, and who is in it behind one button beside adding more, rather than a row of
     chips under the name -->
<template>
  <header v-if="currentDirectMessage" px-2 py-1 flex shrink-0 gap-1 ui-bar items-center>
    <MessageContentShowRoomListButton />
    <div px-3 flex flex-1 gap-2 min-w-0 items-center>
      <UiAvatar :name="directMessageName" is-small />
      <span text-heading-color truncate>{{ directMessageName }}</span>
    </div>
    <div flex shrink-0 gap-1 items-center>
      <UiPopover :label="`Participants: ${participants.length}`" :variant="UiButtonVariant.Quiet">
        <template #trigger>
          <UiIcon :meaning="UiIconMeaning.Members" />
          {{ participants.length }}
        </template>
        <div w="[min(18rem,80dvw)]" flex flex-col>
          <p text-sm text-muted px-2>Participants</p>
          <div v-for="{ id, image, name } of participants" :key="id" ui-row>
            <UiItemContent :image :title="name">
              <template #append>
                <UiIconButton
                  :label="`Remove ${name}`"
                  :meaning="UiIconMeaning.Remove"
                  :variant="UiButtonVariant.Quiet"
                  @click="deleteDirectMessageParticipant(currentDirectMessage.id, id)"
                />
              </template>
            </UiItemContent>
          </div>
        </div>
      </UiPopover>
      <MessageContentHeaderCreateDirectMessageParticipantButton :room-id="currentDirectMessage.id" />
      <MessageContentShowSearchButton />
    </div>
  </header>
</template>
