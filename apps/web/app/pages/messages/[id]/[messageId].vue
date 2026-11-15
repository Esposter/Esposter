<script setup lang="ts">
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { checkIsMessageRoute } from "@/services/router/checkIsMessageRoute";

definePageMeta({ middleware: "auth", validate: checkIsMessageRoute });
const route = useRoute();
// A message's own page is still its room's, so the dock draws the room and a bookmark of the page goes with the room
usePageMark(() => ({ id: route.params.id, type: PageMarkType.Room }));
</script>

<template>
  <NuxtLayout name="messages" />
</template>
