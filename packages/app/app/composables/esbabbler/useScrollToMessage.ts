import { dayjs } from "#shared/services/dayjs";
import { useReplyStore } from "@/store/esbabbler/reply";

export const useScrollToMessage = () => {
  const replyStore = useReplyStore();
  const { activeRowKey } = storeToRefs(replyStore);
  return (rowKey: string) => {
    activeRowKey.value = rowKey;
    document.getElementById(rowKey)?.scrollIntoView();
    useTimeoutFn(() => {
      activeRowKey.value = undefined;
    }, dayjs.duration(2, "seconds").asMilliseconds());
  };
};
