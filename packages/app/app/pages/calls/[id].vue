<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

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
const isDirect = route.query.direct === "1";
const isValid = await useCallIdSubscribables(id);
if (!isValid)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, id),
  });

const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const { joinCall } = callStore;
const knockerStore = useKnockerStore();
const { knockingCallSessionId } = storeToRefs(knockerStore);
if (isDirect) await joinCall(id);

watch(activeCallSessionId, (newActiveCallSessionId) => {
  if (!newActiveCallSessionId) navigateTo(RoutePath.CallsIndex);
});
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <Head>
      <Title>Call</Title>
    </Head>
    <div size-full>
      <MessageContentCallView v-if="activeCallSessionId" />
      <MessageContentCallWaiting v-else-if="knockingCallSessionId" />
      <MessageContentCallPreJoin v-else :call-id="id" />
    </div>
  </NuxtLayout>
</template>
