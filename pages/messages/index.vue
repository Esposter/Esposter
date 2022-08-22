<script setup lang="ts">
import { MESSAGES_PATH } from "@/util/constants";

const client = useClient();

onMounted(async () => {
  const room = await client.query("room.readRoom");

  if (room) navigateTo(MESSAGES_PATH(room.id));
  else navigateTo(MESSAGES_PATH("t"));
});
</script>
