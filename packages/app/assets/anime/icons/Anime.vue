<script setup lang="ts">
const { surface, text } = useColors();
</script>

<template>
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect class="b" x="6.1336" y="9.4032" width="35.7327" height="26.5581" rx="6.7532" />
    <line class="b" x1="17.4835" y1="4.5" x2="20.4078" y2="9.4032" />
    <line class="a" x1="13.2594" y1="21.6849" x2="20.0829" y2="18.9592" />
    <line class="b" x1="30.5165" y1="4.5" x2="27.5922" y2="9.4032" />
    <line class="a" x1="34.7406" y1="21.6849" x2="27.9171" y2="18.9592" />
    <path
      class="a"
      d="M29.0544,24.9161c-.5827,1.4721-1.1508,2.54-2.5273,2.54-1.074,0-1.666-.4976-2.5271-1.8363-.8611,1.3387-1.4531,1.8363-2.5271,1.8363-1.3765,0-1.9446-1.0682-2.5273-2.54"
    />
    <path
      class="b"
      d="M25.9676,35.9613v2.033s8.6917.2889,8.6917,5.5057H13.3407c0-5.2168,8.6917-5.5057,8.6917-5.5057v-2.033"
    />
  </svg>
</template>

<style scoped lang="scss">
.a {
  stroke: v-bind(surface);
}

.b {
  stroke: v-bind(text);
}
</style>
