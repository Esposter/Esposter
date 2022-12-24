<script setup lang="ts">
import { INDEX_PATH } from "@/util/constants.common";

definePageMeta({ middleware: "guest" });

const { signIn } = $(useSession());
</script>

<template>
  <NuxtLayout>
    <template #left>
      <EsposterProductList />
    </template>
    <v-container h="full" display="flex" justify="center" items="center">
      <StyledCard min-width="400">
        <v-container>
          <div class="text-h5" mb="1" text="center">Sign in to</div>
          <div mb="2" display="flex" justify="center" items="center">
            <EsposterLogo />
            <span class="text-h6" ml="2">Esposter</span>
          </div>
          <div class="text-subtitle-1" mb="2" text="center">Login and start taking rides with Esposter!</div>
          <button class="github button" @click="signIn('github', { callbackUrl: INDEX_PATH, replace: true })">
            <VisualGithubLogo w="8" fill="white" />
            <span class="text-surface" mx="auto" font="bold">Github</span>
          </button>
        </v-container>
      </StyledCard>
    </v-container>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.button {
  margin-bottom: 0.625rem;
  padding: 0 0.625rem;
  width: 100%;
  height: 3.125rem;
  display: flex;
  align-items: center;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 10px 2px rgba(0, 0, 0, 0.35);
  }
}

.github {
  background-color: #252525;
}
</style>
