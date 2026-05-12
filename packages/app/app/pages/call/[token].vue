<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const { token } = route.params;
    if (typeof token !== "string") return false;
    const result = await selectCallSessionInMessageSchema.shape.token.safeParseAsync(token);
    return result.success;
  },
});

const route = useRoute();
const token = route.params.token as string;
const isJoined = await useCallTokenSubscribables(token);
if (!isJoined)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.CallSession, token),
  });
</script>

<template>
  <div h-screen w-screen overflow-hidden>
    <Head>
      <Title>Call</Title>
    </Head>
    <CallView />
  </div>
</template>
