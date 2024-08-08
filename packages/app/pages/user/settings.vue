<script setup lang="ts">
import type { SideBarItem } from "@/models/user/SideBarItem";

import { RoutePath } from "@/models/router/RoutePath";
import { useUserStore } from "@/store/user";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const { smAndDown } = useDisplay();
const userStore = useUserStore();
const { authUser } = storeToRefs(userStore);
authUser.value = await $client.user.readUser.query();

const sections: SideBarItem[] = [{ href: RoutePath.UserSettings, title: "General" }];
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col>
          <UserIntroductionCard />
        </v-col>
      </v-row>
      <v-row>
        <v-col :cols="smAndDown ? 12 : 5">
          <UserSideBar class="sidebar" sticky="!" :items="sections" />
        </v-col>
        <v-col :cols="smAndDown ? 12 : 7">
          <UserProfileCard />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.sidebar {
  top: calc(1rem + $app-bar-height);
}
</style>
