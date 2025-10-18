import { useForwardStore } from "@/store/message/forward";
import { StandardMessageEntity } from "@esposter/db-schema";

export const useReadForwards = () => {
  const forwardStore = useForwardStore();
  const { forwardMap } = storeToRefs(forwardStore);
  return (standardMessages: StandardMessageEntity[]) => {
    for (const standardMessage of standardMessages)
      if (standardMessage.isForward) forwardMap.value.set(standardMessage.rowKey, standardMessage);
  };
};
