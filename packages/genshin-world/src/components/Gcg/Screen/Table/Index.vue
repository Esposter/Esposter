<template>
  <!-- The table the board is laid on, and the support zone at the left edge -->
  <div class="table" />
  <div class="support" />
</template>

<style scoped>
/* The support zone at the left edge, a card's back whose trefoil is art: its plate is the panel's own colour */
.support {
  position: absolute;
  top: calc(var(--unit) * 710);
  left: 0;
  width: calc(var(--unit) * 186);
  height: calc(var(--unit) * 174);
  background: #343340;
}

.table {
  position: absolute;
  top: calc(var(--unit) * 72);
  right: calc(var(--unit) * 52);
  bottom: calc(var(--unit) * 76);
  left: calc(var(--unit) * 46);
  border: calc(var(--unit) * 22) solid #7d5a36;
  border-radius: calc(var(--unit) * 40);
  background: radial-gradient(
    calc(var(--unit) * 1000) calc(var(--unit) * 700) at 50% 50%,
    #7c9c9d 0%,
    #759392 45%,
    #6d8b8a 56%,
    #597474 73%,
    #557070 80%,
    #435d5e 92%,
    #3e5352 100%
  );
}
</style>
