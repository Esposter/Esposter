<script setup lang="ts">
import { createEntityNotFoundError } from "#src/services/shared/error/createEntityNotFoundError";
import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { getRouteParam } from "#src/util/router/getRouteParam";
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
const { id } = route.params;
const [{ data: session }, callSession] = await Promise.all([useAuthSession(), useCallIdSubscribables(id)]);
const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { knockingCallSessionId } = storeToRefs(knockerStore);
if (!callSession) throw createEntityNotFoundError(DatabaseEntityType.CallSession, id);

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
      <MessageContentCallWaiting v-else-if="knockingCallSessionId === id" />
      <MessageContentCallPreJoin v-else :call-id="id" :is-creator="callSession.userId === session?.user.id" />
    </div>
  </NuxtLayout>
</template>
