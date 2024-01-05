<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { type SideBarItem } from "@/models/user/SideBarItem";
import { useUserStore } from "@/store/user";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const userStore = useUserStore();
const { authUser } = storeToRefs(userStore);
authUser.value = await $client.user.readUser.query();

const sections: SideBarItem[] = [{ title: "General", href: RoutePath.UserSettings }];
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
        <v-col cols="5">
          <UserSideBar sticky="!" :items="sections" />
        </v-col>
        <v-col cols="7">
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
