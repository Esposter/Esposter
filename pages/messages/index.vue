<script setup lang="ts">
import { MESSAGES_PATH } from "@/util/constants.client";

const { $client } = useNuxtApp();
const room = await $client.room.readRoom.query();
console.log(room);
// if (room) navigateTo(MESSAGES_PATH(room.id));
// else navigateTo(MESSAGES_PATH("t"));
</script>
