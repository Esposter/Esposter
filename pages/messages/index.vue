<script setup lang="ts">
import { MESSAGES_PATH } from "@/util/constants.client";

const { $client } = useNuxtApp();
const { data } = await $client.room.readRoom.query();
if (data.value) navigateTo(MESSAGES_PATH(data.value.id));
else navigateTo(MESSAGES_PATH("t"));
</script>
