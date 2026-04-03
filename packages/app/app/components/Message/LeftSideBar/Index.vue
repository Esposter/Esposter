<template>
  <div flex flex-col h-full>
    <MessageLeftSideBarHeader />
    <v-divider />
    <div flex-1 overflow-y-auto>
      <MessageLeftSideBarRooms />
      <v-divider />
      <MessageLeftSideBarDirectMessages />
    </div>
    <MessageLeftSideBarStatusBar />
  </div>
</template>
