<script setup lang="ts">
import MailScreen from "#src/components/Mail/Screen/Index.vue";
import { useWorldMailStore } from "#src/store/mail";
import { useWorldSessionStore } from "#src/store/session";

const emit = defineEmits<{ close: [] }>();
const worldSessionStore = useWorldSessionStore();
const { gameText, materialDataMap, nameText, worldNow } = storeToRefs(worldSessionStore);
const worldMailStore = useWorldMailStore();
const { isBagFull, mailData, mails } = storeToRefs(worldMailStore);
const { claim, claimAll, deleteGift, deleteRead, markMailRead, toggleMailPin } = worldMailStore;
</script>

<template>
  <!-- eslint-disable vue/no-restricted-syntax -- the Mail screen's own confirm dialog asks first and emits a delete only once the player confirms -->
  <MailScreen
    v-if="mailData"
    :birthday-mail-ids="mailData.birthdayMailIds"
    :game-text
    :is-bag-full
    :mail-rows="mailData.mailRows"
    :mails
    :material-data-map
    :names="nameText"
    :now="worldNow"
    :text-map="mailData.textMap"
    @claim="(mail) => claim(mail)"
    @claim-all="claimAll()"
    @close="emit('close')"
    @delete-gift="(mail) => deleteGift(mail)"
    @delete-read="deleteRead()"
    @read="(mail) => markMailRead(mail)"
    @pin="(mail) => toggleMailPin(mail)"
  />
  <!-- eslint-enable vue/no-restricted-syntax -->
</template>
