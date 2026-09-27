<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { useDirectMessageStore } from "@/store/message/room/directMessage";

const directMessageStore = useDirectMessageStore();
const { currentDirectMessage } = storeToRefs(directMessageStore);
const { deleteDirectMessageParticipant, getDirectMessageParticipants } = directMessageStore;
const directMessageName = useDirectMessageName(currentDirectMessage);
const session = authClient.useSession();
// Discord's rule: anyone leaves a group direct message, and only its owner removes somebody else
const isOwner = computed(() => currentDirectMessage.value?.userId === session.value.data?.user.id);
const participants = computed(() =>
  currentDirectMessage.value ? getDirectMessageParticipants(currentDirectMessage.value.id) : [],
);
// Mounted outside the popover, which closes as the confirm opens over it
const removingParticipantId = ref("");
const { isOpen: isRemoveOpen, item: removingParticipant } = useSingletonDialog(removingParticipantId, () =>
  participants.value.find(({ id }) => id === removingParticipantId.value),
);
</script>

<!-- A direct message's name on one line, and who is in it behind one button beside adding more, rather than a row of
     chips under the name -->
<template>
  <header v-if="currentDirectMessage" px-2 py-1 flex shrink-0 gap-1 ui-bar items-center>
    <AppDrawerButton label="Show Room List" :meaning="UiIconMeaning.Menu" />
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
              <template v-if="isOwner" #append>
                <UiIconButton
                  :label="`Remove ${name}`"
                  :meaning="UiIconMeaning.Remove"
                  :variant="UiButtonVariant.Quiet"
                  @click="removingParticipantId = id"
                />
              </template>
            </UiItemContent>
          </div>
        </div>
      </UiPopover>
      <MessageContentHeaderCreateDirectMessageParticipantButton :room-id="currentDirectMessage.id" />
      <MessageContentShowSearchButton />
    </div>
    <UiConfirmDialog
      v-if="removingParticipant"
      v-model="isRemoveOpen"
      confirm-label="Remove"
      :title="`Remove ${removingParticipant.name}`"
      :confirm="
        () =>
          currentDirectMessage &&
          removingParticipant &&
          deleteDirectMessageParticipant(currentDirectMessage.id, removingParticipant.id)
      "
      is-optimistic
    >
      <p>Remove {{ removingParticipant.name }} from this conversation?</p>
    </UiConfirmDialog>
  </header>
</template>
