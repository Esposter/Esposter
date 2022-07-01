<script setup lang="ts">
import NProgress from "nprogress";

let timeoutId: NodeJS.Timeout | null = null;

const pageStart = () => {
  NProgress.configure({ easing: "ease", speed: 500 });
  NProgress.set(0.3);
  NProgress.start();
};

const pageEnd = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => NProgress.done(true), 200);
};

const nuxtApp = useNuxtApp();

nuxtApp.hook("app:mounted", () => {
  nuxtApp.hook("page:start", pageStart);
  nuxtApp.hook("page:finish", pageEnd);
});

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<style lang="scss">
$background: repeating-linear-gradient(to right, #00dc82 0%, #34cdfe 50%, #0047e1 100%);

#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: 3px;
  background: $background;
  z-index: 9999;
}

/* Fancy blur effect */
#nprogress .peg {
  display: block;
  position: absolute;
  right: 0px;
  width: 100px;
  height: 100%;
  box-shadow: 0 0 10px $background, 0 0 5px $background;
  opacity: 1;
  -webkit-transform: rotate(3deg) translate(0px, -4px);
  -ms-transform: rotate(3deg) translate(0px, -4px);
  transform: rotate(3deg) translate(0px, -4px);
}
</style>
