<template>
  <!-- The game's notice card, dropped at the top of a screen: white with rounded corners, 107 units high and at least -->
  <!-- 537 across, a round mark at its left and its words in the game's near black. Measured from a 1440 high -->
  <!-- Recording of the welcome the login screen shows -->
  <div class="toast-notice" role="status">
    <span class="mark"><slot name="mark" /></span>
    <p class="text"><slot /></p>
  </div>
</template>

<style scoped>
.toast-notice {
  position: relative;
  display: flex;
  min-width: calc(var(--unit) * 537);
  height: calc(var(--unit) * 107);
  box-sizing: border-box;
  align-items: center;
  padding: 0 calc(var(--unit) * 82) 0 calc(var(--unit) * 148);
  border-radius: calc(var(--unit) * 12);
  background: #fff;
}

.mark {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 61);
  display: grid;
  width: calc(var(--unit) * 59);
  height: calc(var(--unit) * 59);
  overflow: hidden;
  border-radius: 50%;
  background: #000;
  place-items: center;
  translate: 0 -50%;
}

.text {
  margin: 0;
  color: #1d1d1d;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
</style>
