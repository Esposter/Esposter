<template>
  <!-- The two name plates and their portrait discs, the portraits' art not drawn -->
  <div class="plate opponent-plate" />
  <div class="avatar opponent-avatar" />
  <div class="plate player-plate" />
  <div class="avatar player-avatar" />
</template>

<style scoped>
/* The two name plates and their portrait discs: each plate is the colour the frame holds under its name */
.plate {
  position: absolute;
  border-radius: 0 calc(var(--unit) * 20) calc(var(--unit) * 20) 0;
}

.opponent-plate {
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 118);
  width: calc(var(--unit) * 248);
  height: calc(var(--unit) * 42);
  background: #3a5274;
}

/* The player's plate is the frame's gold, lit at its left under the name and dark at its right end */
.player-plate {
  top: calc(var(--unit) * 978);
  left: calc(var(--unit) * 130);
  width: calc(var(--unit) * 238);
  height: calc(var(--unit) * 42);
  background: linear-gradient(
    to right,
    #bd8e4e 0%,
    #e6ad66 25%,
    #e6ad66 46%,
    #c38f52 67%,
    #8f642c 80%,
    #7a5631 90%,
    #5d4630 100%
  );
}

.avatar {
  position: absolute;
  box-sizing: border-box;
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
  border: calc(var(--unit) * 4) solid;
  border-radius: 50%;
}

/* Each portrait disc is the frame's ring around its art, the art's own mean colour inside */
.opponent-avatar {
  top: calc(var(--unit) * 21);
  left: calc(var(--unit) * 51);
  width: calc(var(--unit) * 84);
  height: calc(var(--unit) * 84);
  border-width: calc(var(--unit) * 8);
  border-color: #5f7fa6;
  background: #acb0c0;
}

.player-avatar {
  top: calc(var(--unit) * 975);
  left: calc(var(--unit) * 51);
  width: calc(var(--unit) * 84);
  height: calc(var(--unit) * 84);
  border-color: #c99a4a;
  background: #c8aa82;
}
</style>
