<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { CALL_ID_LENGTH } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const callStore = useCallStore();
const { createCall } = callStore;
const callCodeOrLink = ref("");
const isCreating = ref(false);
const isJoining = ref(false);
const callId = computed(() => normalizeString(callCodeOrLink.value).match(/[A-Za-z0-9]{12}/u)?.[0] ?? "");
const canJoin = computed(() => callId.value.length === CALL_ID_LENGTH);
const startCall = async () => {
  isCreating.value = true;
  const newCallSessionId = await createCall();
  isCreating.value = false;
  if (!newCallSessionId) return;
  await router.push(`/call/${newCallSessionId}`);
};
const joinCall = async () => {
  if (!canJoin.value) return;
  isJoining.value = true;
  await router.push(`/call/${callId.value}`);
  isJoining.value = false;
};
</script>

<template>
  <v-container flex flex-col min-h-screen>
    <Head>
      <Title>Esposter Calls</Title>
    </Head>
    <v-row flex-1 align="center" justify="center">
      <v-col cols="12" lg="7" md="8" sm="10">
        <div text-center flex flex-col gap-y-8 items-center>
          <v-img alt="Esposter" src="/icon-192x192.png" width="5rem" />
          <div flex flex-col gap-y-3>
            <h1 text-h3>Video calls for everyone</h1>
            <span text-h6 text-medium-emphasis>Connect and share with Esposter Calls</span>
          </div>
          <div flex flex-wrap gap-3 justify-center>
            <v-tooltip text="Start a new call">
              <template #activator="{ props }">
                <v-btn
                  :="props"
                  :loading="isCreating"
                  color="primary"
                  prepend-icon="mdi-video-plus"
                  text="New call"
                  @click="startCall()"
                />
              </template>
            </v-tooltip>
            <v-form flex flex-wrap gap-3 justify-center @submit.prevent="joinCall()">
              <v-text-field
                v-model="callCodeOrLink"
                density="compact"
                label="Enter a code or link"
                prepend-inner-icon="mdi-keyboard"
                hide-details
                max-w-80
                min-w-72
              />
              <v-tooltip text="Join call">
                <template #activator="{ props }">
                  <v-btn
                    :="props"
                    :disabled="!canJoin"
                    :loading="isJoining"
                    prepend-icon="mdi-login"
                    text="Join"
                    type="submit"
                  />
                </template>
              </v-tooltip>
            </v-form>
          </div>
          <v-divider w-full />
          <div style="grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr))" gap-4 grid w-full>
            <div p-4 rd-2 bg-surface flex flex-col gap-y-2>
              <v-icon color="primary" icon="mdi-monitor-share" size="large" />
              <span font-medium text-body-medium>Share your screen</span>
              <span text-medium-emphasis text-body-small>Present tabs, windows, or your display in the call.</span>
            </div>
            <div p-4 rd-2 bg-surface flex flex-col gap-y-2>
              <v-icon color="primary" icon="mdi-video-cog" size="large" />
              <span font-medium text-body-medium>Choose devices</span>
              <span text-medium-emphasis text-body-small>Switch microphone, speakers, and camera while connected.</span>
            </div>
            <div p-4 rd-2 bg-surface flex flex-col gap-y-2>
              <v-icon color="primary" icon="mdi-link-variant" size="large" />
              <span font-medium text-body-medium>Invite with a link</span>
              <span text-medium-emphasis text-body-small>Copy the call link and send it to anyone joining.</span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
