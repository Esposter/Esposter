<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: ["auth", "messages-client"] });

useHead({ titleTemplate: MESSAGE_DISPLAY_NAME });
const { $trpc } = useNuxtApp();
const room = await $trpc.room.readRoom.query();
// The last room, or with none the friends page, as Discord's home is its friends list
await navigateTo(room ? RoutePath.Messages(room.id) : RoutePath.MessagesFriends, { replace: true });
</script>
