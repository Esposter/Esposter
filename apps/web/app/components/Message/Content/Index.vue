<script setup lang="ts">
import { COMPOSER_ATTRIBUTE } from "@/services/app/constants";
</script>

<!-- The room is one column: its header, the call, the list that scrolls, and the composer, which stays at the foot
     of the column rather than floating over the page -->
<template>
  <div flex flex-col h-full relative ui-body>
    <MessageContentHeader />
    <MessageContentCallPanel />
    <MessageModelMessageList />
    <MessageModelMessageJumpToPresentSnackbar />
    <footer :[COMPOSER_ATTRIBUTE]="true" px-4 pt-2 bg-panel shrink-0>
      <MessageContentMobileActionBar />
      <MessageModelMessageInput />
    </footer>
  </div>
</template>
