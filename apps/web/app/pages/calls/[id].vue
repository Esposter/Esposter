<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { getRouteParam } from "@/util/router/getRouteParam";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const id = getRouteParam(route.params, "id");
    const parsedId = await selectCallSessionInMessageSchema.shape.id.safeParseAsync(id);
    return parsedId.success;
  },
});

const route = useRoute();
const { data: session } = await useAuthSession();
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { knockingCallSessionId } = storeToRefs(knockerStore);
const { id } = route.params;
const callSession = await useCallIdSubscribables(id);
if (!callSession)
  throw createError({ status: 404, statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, id) });

watch(activeCallSessionId, async (newActiveCallSessionId) => {
  if (!newActiveCallSessionId) await navigateTo(RoutePath.CallsIndex);
});
</script>

<template>
  <NuxtLayout is-viewport-height>
    <Head>
      <Title>Calls</Title>
    </Head>
    <div size-full ui-body>
      <MessageContentCallView v-if="activeCallSessionId" />
      <MessageContentCallWaiting v-else-if="knockingCallSessionId" />
      <MessageContentCallPreJoin v-else :call-id="id" :is-creator="callSession.userId === session?.user.id" />
    </div>
  </NuxtLayout>
</template>
