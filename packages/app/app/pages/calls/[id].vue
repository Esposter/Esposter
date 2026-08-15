<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { requireRouteParam } from "@/util/router/requireRouteParam";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const { id } = route.params;
    if (typeof id !== "string") return false;
    const result = await selectCallSessionInMessageSchema.shape.id.safeParseAsync(id);
    return result.success;
  },
});

const { currentRoute } = useRouter();
const id = requireRouteParam(currentRoute.value.params, "id");
const callSession = await useCallIdSubscribables(id);
if (!callSession)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, id),
  });

const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
const knockerStore = useKnockerStore();
const { knockingCallSessionId } = storeToRefs(knockerStore);
const { data: session } = await authClient.useSession(useFetch);

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
      <MessageContentCallPreJoin v-else :call-id="id" :is-creator="callSession.userId === session?.user.id" />
    </div>
  </NuxtLayout>
</template>
