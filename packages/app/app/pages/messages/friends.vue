<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { readFriends } = useReadFriends();
await readFriends();
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <v-sheet flex flex-col h-full overflow-y-auto>
      <v-container flex flex-col gap-y-8>
        <div font-bold text-headline-small>Friends</div>
        <MessageFriendsSearch />
        <MessageFriendsRequestList />
        <MessageFriendsList />
        <MessageFriendsBlockedList />
      </v-container>
    </v-sheet>
  </NuxtLayout>
</template>
