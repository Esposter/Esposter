<script setup lang="ts">
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
        <h1 ui-title>Friends</h1>
        <MessageFriendsSearch />
        <MessageFriendsRequestList />
        <MessageFriendsList />
        <MessageFriendsBlockedList />
      </div>
    </div>
  </NuxtLayout>
</template>
