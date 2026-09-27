<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

definePageMeta({ middleware: "auth" });
useHead({ title: "Friends" });

const readFriends = useReadFriends();
await readFriends();
</script>

<template>
  <NuxtLayout is-viewport-height>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div h-full of-y-auto>
      <div p-6 flex flex-col gap-8 ui-body>
        <div flex gap-2 items-center>
          <AppDrawerButton label="Show Room List" :meaning="UiIconMeaning.Menu" />
          <h1 ui-title>Friends</h1>
        </div>
        <MessageFriendsSearch />
        <MessageFriendsRequestList />
        <MessageFriendsList />
        <MessageFriendsBlockedList />
      </div>
    </div>
  </NuxtLayout>
</template>
