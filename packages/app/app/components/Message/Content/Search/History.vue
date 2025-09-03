<template>
  <div mb-2 text-sm font-extrabold>History</div>
  <MessageModelMessageList :messages="[]" />
  <div py-2 flex justify-center>
    <v-btn variant="text">Load more</v-btn>
  </div>
</template>
