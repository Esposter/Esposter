<script setup lang="ts">
import { COMPOSER_ATTRIBUTE } from "@/services/app/constants";
</script>

<!-- The room is one column: its header, the call, the list that scrolls, and the composer, which stays at the foot
     of the column rather than floating over the page. The list is a column of its own for what floats at its foot, the
     jump back to the present, to sit above the composer rather than over it; never inside the footer, whose composer
     mark would read a tap on the jump as typing and step the dock aside -->
<template>
  <div flex flex-col h-full relative ui-body>
    <MessageContentHeader />
    <MessageContentCallPanel />
    <div flex flex-1 flex-col min-h-0 relative>
      <MessageModelMessageList />
      <MessageModelMessageJumpToPresentSnackbar />
    </div>
    <footer :[COMPOSER_ATTRIBUTE]="true" px-4 pt-2 bg-panel shrink-0>
      <MessageModelMessageInput />
    </footer>
  </div>
</template>
