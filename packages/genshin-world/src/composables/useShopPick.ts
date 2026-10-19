import { ref } from "vue";

// The good the player picks in a shop and the count it is bought in, both cleared back to their first values once a
// Purchase is made
export const useShopPick = () => {
  const count = ref(1);
  const goodId = ref(0);
  const resetShopPick = () => {
    goodId.value = 0;
    count.value = 1;
  };
  return { count, goodId, resetShopPick };
};
