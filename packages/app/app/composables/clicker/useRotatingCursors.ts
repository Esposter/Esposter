import { Target } from "#shared/models/clicker/data/Target";
import { dayjs } from "#shared/services/dayjs";
import { useClickerStore } from "@/store/clicker";
import { takeOne } from "@esposter/shared";

export const useRotatingCursors = () => {
  const clickerStore = useClickerStore();
  const { clicker } = storeToRefs(clickerStore);
  const amount = computed(() => {
    const cursorBuilding = clicker.value.boughtBuildings.find(({ id }) => id === Target.Cursor);
    return cursorBuilding?.amount ?? 0;
  });
  // A stable per-instance prefix keyed by index — regenerating ids on every amount change would rekey
  // The v-for and make Vue destroy/recreate every cursor node, resetting all animations on each purchase
  const instanceId = crypto.randomUUID();
  const rotatingDivIds = computed(() =>
    Array.from({ length: amount.value }, (_value, index) => `${instanceId}-${index}`),
  );
  const animateCursors = (cursorCount: number) => {
    const initialRotationOffsets = Array.from({ length: cursorCount }, (_value, index) => (360 / cursorCount) * index);

    for (let i = 0; i < cursorCount; i++) {
      const rotationOffset = takeOne(initialRotationOffsets, i);
      const rotatingDivId = takeOne(rotatingDivIds.value, i);
      const rotatingDiv = window.document.getElementById(rotatingDivId);
      if (!rotatingDiv) continue;

      // Nodes are reused now, so clear any prior infinite animation before adding the new one
      rotatingDiv.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      rotatingDiv.animate(
        [{ transform: `rotate(${rotationOffset}deg)` }, { transform: `rotate(${rotationOffset + 360}deg)` }],
        { duration: dayjs.duration(60, "seconds").asMilliseconds(), iterations: Infinity },
      );
    }
  };

  const { trigger } = watchTriggerable(
    amount,
    (newAmount) => {
      animateCursors(newAmount);
    },
    // Animate after vue has updated the DOM with new cursors
    { flush: "post" },
  );

  onMounted(() => {
    trigger();
  });

  return { rotatingDivIds };
};
