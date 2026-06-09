<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";

defineRouteRules({ ssr: false });
definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const { id } = route.params;
    if (typeof id !== "string") return false;
    const result = await selectCallSessionInMessageSchema.shape.id.safeParseAsync(id);
    return result.success;
  },
});

const route = useRoute();
const id = route.params.id as string;
const callSession = await useCallIdSubscribables(id);
if (!callSession)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, id),
  });

const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const { joinCall } = callStore;
const knockerStore = useKnockerStore();
const { knockingCallSessionId } = storeToRefs(knockerStore);
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => callSession.userId === session.value?.user.id);
onMounted(async () => {
  if (!isCreator.value) return;
  await getResultAsync(() => joinCall(id)).match(noop, async (error) => {
    console.error(`Unable to join call: ${error.message}`);
    await navigateTo(RoutePath.CallsIndex);
  });
});

watch(activeCallSessionId, async (newActiveCallSessionId) => {
  if (!newActiveCallSessionId) await navigateTo(RoutePath.CallsIndex);
});
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <Head>
      <Title>Calls</Title>
    </Head>
    <div size-full>
      <MessageContentCallView v-if="activeCallSessionId" />
      <MessageContentCallWaiting v-else-if="knockingCallSessionId" />
      <MessageContentCallPreJoin v-else :call-id="id" />
    </div>
  </NuxtLayout>
</template>
