<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useCallStore } from "@/store/message/room/call";
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
const isJoined = await useCallIdSubscribables(id);
if (!isJoined)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, id),
  });

const callStore = useCallStore();
const { activeCallSessionId } = storeToRefs(callStore);
watch(activeCallSessionId, (newActiveCallSessionId) => {
  if (!newActiveCallSessionId) navigateTo(RoutePath.CallIndex);
});
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <div size-full overflow-hidden>
      <Head>
        <Title>Call</Title>
      </Head>
      <MessageContentCallView />
    </div>
  </NuxtLayout>
</template>
