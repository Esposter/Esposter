<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";

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
const isJoined = await useCallTokenSubscribables(id);
if (!isJoined)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, id),
  });
</script>

<template>
  <div size-screen overflow-hidden>
    <Head>
      <Title>Call</Title>
    </Head>
    <CallView />
  </div>
</template>
