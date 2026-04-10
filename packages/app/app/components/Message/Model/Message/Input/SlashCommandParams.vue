<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";
import type { VForm } from "vuetify/components";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { formRules } from "@/services/vuetify/formRules";
import { useDataStore } from "@/store/message/data";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
import { marked } from "marked";

const formRef = useTemplateRef<InstanceType<typeof VForm>>("formRef");
const isFormValid = ref(true);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const slashCommandStore = useSlashCommandStore();
const { paramValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
const dataStore = useDataStore();
const { createMessage } = dataStore;

const onSubmit = async (event: SubmitEventPromise) => {
  const { valid } = await event;
  if (!valid || !pendingSlashCommand.value || !currentRoomId.value) return;

  const { type } = pendingSlashCommand.value;
  const params = paramValues.value;
  const roomId = currentRoomId.value;

  switch (type) {
    case SlashCommandType.Me:
      await createMessage({
        message: marked.parse(`*${params.message}*`, { async: false }),
        roomId,
        type: MessageType.Message,
      });
      break;
    case SlashCommandType.Shrug: {
      const prefix = params.text?.trim() ? `${params.text.trim()} ` : "";
      await createMessage({
        message: marked.parse(`${prefix}¯\\\\\\_(ツ)\\_/¯`, { async: false }),
        roomId,
        type: MessageType.Message,
      });
      break;
    }
  }

  slashCommandStore.clearPendingSlashCommand();
};

const onDismiss = () => slashCommandStore.clearPendingSlashCommand();

useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") onDismiss();
});
</script>

<template>
  <div v-if="pendingSlashCommand" w-full>
    <div class="bg-background" relative text-sm px-4 py-2 rd-t-2 flex items-center gap-2>
      <v-icon icon="mdi-slash-forward" size="small" />
      <span>
        <span font-bold>{{ pendingSlashCommand.title }}</span>
        <span opacity-60 ml-1>{{ pendingSlashCommand.description }}</span>
      </span>
      <StyledEditFormDialogErrorIcon :edit-form="formRef ?? undefined" :is-edit-form-valid="isFormValid" />
      <v-btn
        absolute
        top="1/2"
        right-4
        translate-y="-1/2"
        icon="mdi-close"
        size="small"
        density="compact"
        @click="onDismiss"
      />
    </div>
    <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmit">
      <StyledCard>
        <div flex items-start gap-2 px-4 py-3>
          <template v-for="{ description, isRequired, name } of pendingSlashCommand.parameters" :key="name">
            <v-text-field
              v-model="paramValues[name]"
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
                :="tooltipProps"
              />
            </template>
          </v-tooltip>
        </div>
      </StyledCard>
    </v-form>
  </div>
</template>
