import type { Room } from "#shared/db/schema/rooms";

import { RoutePath } from "#shared/models/router/RoutePath";

export const useRefreshRoom = (rooms: ComputedRef<Room[]>) => {
  const router = useRouter();
  return async () => {
    rooms.value.length > 0
      ? await router.push({ path: RoutePath.Messages(rooms.value[0].id), replace: true })
      : await router.push({ path: RoutePath.MessagesIndex, replace: true });
  };
};
