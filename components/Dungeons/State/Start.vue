<template>
  <v-container h-full>
    <v-row h-full>
      <v-col h-full flex flex-col items-center cols="12">
        <v-spacer />
        <div class="header" text-4xl>Dungeons</div>
        <v-spacer />
        <v-btn class="button" variant="outlined">
          <v-icon icon="custom:dungeon-gate" />
          <span class="paragraph" pl-2 text-2xl>New Game</span>
        </v-btn>
        <v-btn class="button" mt-4 variant="outlined">
          <v-icon icon="custom:load" />
          <span class="paragraph" pl-2 text-2xl>Load Game</span>
        </v-btn>
        <v-spacer flex-grow-5="!" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.button {
  width: 11rem;
}
</style>
