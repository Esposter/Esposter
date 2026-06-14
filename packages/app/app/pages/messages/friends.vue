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
    <div bg-surface flex flex-col h-full overflow-y-auto>
      <v-container>
        <div font-bold mb-6 text-headline-small>Friends</div>
        <MessageFriendsSearch />
        <MessageFriendsRequestList />
        <MessageFriendsList />
        <MessageFriendsBlockedList />
      </v-container>
    </div>
  </NuxtLayout>
</template>
