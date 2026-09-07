import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";

import { useTodoListStore } from "@/store/resource/todoList";
import { getRouteParamString } from "@/util/router/getRouteParamString";

// Saves from other devices stream in over onSaveResourceContent, so the item table and calendar
// Stay live without any polling or manual refresh
export const useTodoListSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const todoListStore = useTodoListStore();
  const { storeSaveResourceContent } = todoListStore;

  useOnlineSubscribable(
    () => getRouteParamString(currentRoute.value.params.id),
    (id) => {
      if (!id) return undefined;

      const saveResourceContentUnsubscribable = $trpc.todoList.onSaveResourceContent.subscribe(
        { id },
        {
          onData: ({ content, contentVersion }) => {
            // The wire shape is the schema's plain data; the store treats it as its content type,
            // Mirroring how loadContent adopts readContent's payload
            storeSaveResourceContent(content as TodoListResource, contentVersion);
          },
        },
      );

      return () => {
        saveResourceContentUnsubscribable.unsubscribe();
      };
    },
  );
};
