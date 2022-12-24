<script setup lang="ts">
const { signIn } = useSession();
</script>

<template>
  <v-card>
    <p>Sign-In Options:</p>
    <button @click="signIn('github')">Github</button>
  </v-card>
</template>
