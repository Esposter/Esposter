<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { type SideBarItem } from "@/models/user/SideBarItem";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const user = await $client.user.readUser.query();
const sections: SideBarItem[] = [{ title: "General", href: RoutePath.UserSettings }];
</script>

<template>
  <NuxtLayout>
    <v-container v-if="user">
      <v-row>
        <v-col>
          <!-- @TODO: https://github.com/vuejs/language-tools/issues/3830 -->
          <!-- eslint-disable-next-line vue/valid-v-bind -->
          <UserIntroductionCard :user />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="5">
          <UserSideBar sticky="!" :items="sections" />
        </v-col>
        <v-col cols="7">
          <!-- @TODO: https://github.com/vuejs/language-tools/issues/3830 -->
          <!-- eslint-disable-next-line vue/valid-v-bind -->
          <UserProfileCard :user />
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
