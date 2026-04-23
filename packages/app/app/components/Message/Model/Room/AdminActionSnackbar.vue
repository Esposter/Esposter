<script setup lang="ts">
const { isVisible, message } = useAdminActionNotification();
</script>

<template>
  <v-snackbar :model-value="isVisible" color="error">
    <div flex justify-center items-center>
      {{ message }}
    </div>
  </v-snackbar>
</template>
