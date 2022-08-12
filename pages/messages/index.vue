<script setup lang="ts">
import { MESSAGES_PATH } from "@/util/constants";
import { NIL } from "uuid";

const client = useClient();
const room = await client.query("room.readRoom");

if (room) navigateTo(MESSAGES_PATH(room.id));
else navigateTo(NIL);
</script>
