<script setup lang="ts">
import { CallFeatures } from "@/services/message/room/call/CallFeatures";

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Esposter Calls</Title>
    </Head>
    <v-container flex flex-col h-full>
      <v-row flex-1 align="center" justify="center">
        <v-col cols="12" lg="7" md="8" sm="10">
          <div text-center flex flex-col gap-y-8 items-center>
            <AppLogo width="5rem" />
            <div flex flex-col gap-y-3>
              <h1 text-display-small>Video calls for everyone</h1>
              <span op-medium-emphasis text-headline-small>Connect and share with Esposter Calls</span>
            </div>
            <div flex flex-wrap gap-3 items-center justify-center>
              <MessageContentCallStartButton />
              <MessageContentCallJoinForm />
            </div>
            <v-divider w-full />
            <div grid-cols="[repeat(auto-fit,minmax(12rem,1fr))]" gap-4 grid w-full>
              <MessageContentCallFeatureCard v-for="feature of CallFeatures" :key="feature.title" :="feature" />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
