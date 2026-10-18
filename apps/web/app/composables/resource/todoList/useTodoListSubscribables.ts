import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useTodoListStore } from "@/store/resource/todoList";
import { getRouteParam } from "@/util/router/getRouteParam";
import { getResultAsync, noop } from "@esposter/shared";

// Saves from other devices stream in over onSaveResourceContent, so the item table and calendar
// Stay live without any polling or manual refresh
export const useTodoListSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const todoListStore = useTodoListStore();
  const { storeSaveResourceContent } = todoListStore;

  useOnlineSubscribable(
    () => getRouteParam(currentRoute.value.params, "id"),
    (id) => {
      if (!id) return undefined;

      return getUnsubscribe(
        $trpc.todoList.onSaveResourceContent.subscribe(
          { id },
          {
            // The stream names the new version only, so the saved content is re-read and adopted with it
            onData: ({ contentVersion }) =>
              getResultAsync(() => $trpc.todoList.readResourceContent.query({ id })).match(
                (content) => storeSaveResourceContent(content as TodoListResource, contentVersion),
                console.error,
              ),
          },
        ),
      );
    },
  );
};
