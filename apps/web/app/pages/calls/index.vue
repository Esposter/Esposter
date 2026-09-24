<script setup lang="ts">
import { CallFeatures } from "@/services/message/room/call/CallFeatures";

definePageMeta({
  middleware: "auth",
});
</script>

<!-- Meet's landing: what calls are and the two ways into one on the left, what a call can do beside them -->
<template>
  <NuxtLayout>
    <Head>
      <Title>Esposter Calls</Title>
    </Head>
    <div p-6 gap-12 grid min-h-full items-center ui-body lg:p-12 lg:cols-2>
      <div flex flex-col gap-6>
        <AppLogo width="4rem" />
        <div flex flex-col gap-2>
          <h1 ui-display>Video calls for everyone</h1>
          <p text-muted>Connect and share with Esposter Calls.</p>
        </div>
        <div flex flex-col gap-3 sm:flex-row sm:items-end>
          <MessageContentCallStartButton />
          <MessageContentCallJoinForm flex-1 />
        </div>
      </div>
      <div flex flex-col gap-6>
        <MessageContentCallFeatureCard v-for="feature of CallFeatures" :key="feature.title" :="feature" />
      </div>
    </div>
  </NuxtLayout>
</template>
