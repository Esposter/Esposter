<script setup lang="ts">
import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";
import type { SubmitEventPromise } from "vuetify";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { formRules } from "@/services/vuetify/formRules";
import { useDataStore } from "@/store/message/data";
import { useReplyStore } from "@/store/message/input/reply";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { marked } from "marked";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const slashCommandStore = useSlashCommandStore();
const { parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
const dataStore = useDataStore();
const { createMessage } = dataStore;
const isFormValid = ref(true);
const { execute, isLoading } = useInFlight();
const replyStore = useReplyStore();
const { rowKey } = storeToRefs(replyStore);

const submit = (event: SubmitEventPromise) =>
  execute(async () => {
    const { valid } = await event;
    if (!valid || !pendingSlashCommand.value || !currentRoomId.value) return;
    const command = { parameterValues: parameterValues.value, type: pendingSlashCommand.value.type } as {
      [K in SlashCommandType]: { parameterValues: SlashCommandParameters<K>; type: K };
    }[SlashCommandType];
    const roomId = currentRoomId.value;

    switch (command.type) {
      case SlashCommandType.Me:
        await createMessage({
          message: marked.parse(`*${sanitizeHtml(command.parameterValues.message)}*`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      case SlashCommandType.Shrug: {
        const prefix = command.parameterValues.text?.trim() ?? "";
        await createMessage({
          message: marked.parse(`${prefix}¯\\\\\\_(ツ)\\_/¯`, { async: false }),
          roomId,
          type: MessageType.Message,
        });
        break;
      }
    }

    clearPendingSlashCommand();
  });

useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") clearPendingSlashCommand();
});
</script>

<template>
  <div v-if="pendingSlashCommand" w-full>
    <v-form v-model="isFormValid" @submit.prevent="submit">
      <StyledCard :class="{ 'rd-t-none': rowKey }">
        <div flex items-start gap-2 px-4 py-3>
          <template v-for="{ description, isRequired, name } of pendingSlashCommand.parameters" :key="name">
            <v-text-field
              v-model="parameterValues[name]"
              :placeholder="isRequired ? name : `${name} (optional)`"
              :label="description"
              :rules="isRequired ? [formRules.required] : []"
              density="compact"
              variant="plain"
              hide-details
              autofocus
              flex-1
            />
          </template>
          <v-tooltip text="Send (Enter)">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                type="submit"
                icon="mdi-send"
                size="small"
                density="compact"
                variant="text"
                mt-2
                :disabled="isLoading"
                :loading="isLoading"
                :="tooltipProps"
              />
            </template>
          </v-tooltip>
        </div>
      </StyledCard>
    </v-form>
    <div flex justify-between px-1 pt-1>
      <MessageModelMessageInputFooter />
    </div>
  </div>
</template>
