import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { authClient } from "#src/services/auth/authClient";
import { roomCategoryTable } from "#src/services/message/roomCategory/constants";
import { createRoomCategoryConfirmations } from "#src/services/message/roomCategory/createRoomCategoryConfirmations";
import { getCreateRoomCategoryEntry } from "#src/services/message/roomCategory/getCreateRoomCategoryEntry";
import { getDeleteRoomCategoryEntry } from "#src/services/message/roomCategory/getDeleteRoomCategoryEntry";
import { getReorderRoomCategoriesEntry } from "#src/services/message/roomCategory/getReorderRoomCategoriesEntry";
import { getRoomCategoryPositionUpdates } from "#src/services/message/roomCategory/getRoomCategoryPositionUpdates";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { NO_ROW_VERSION } from "@esposter/db-schema";
import { v7 } from "uuid";

export const useRoomCategoryStore = defineStore("message/roomCategory", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const roomCategoryRows = view(roomCategoryTable);
  // A category the client drew before the server answered carries NO_ROW_VERSION. The server appends a new category below
  // The rows it holds, so such a placeholder is listed after them, in issue order, whatever position it carries
  const roomCategories = computed(() =>
    roomCategoryRows.value
      .filter((roomCategory) => checkIsVersioned(roomCategory))
      .toSorted(
        (firstRoomCategory, secondRoomCategory) =>
          Number(firstRoomCategory.version === NO_ROW_VERSION) -
            Number(secondRoomCategory.version === NO_ROW_VERSION) ||
          firstRoomCategory.position - secondRoomCategory.position,
      ),
  );
  // A read's rows arrive as they are, tombstones included, so a deletion the read carries removes the category
  const arriveRoomCategories = (rows: RoomCategoryInMessage[]) => {
    for (const row of rows) arrive(roomCategoryTable, row);
  };
  // The category is drawn under the id the client gives it, at a placeholder that holds no version. The server's row
  // Arrives in the answer, and its header confirms the placeholder at the version it names
  const createRoomCategory = (input: Except<CreateRoomCategoryInput, "id">) => {
    if (!session.value.data) return;

    const roomCategory: RoomCategoryInMessage = {
      createdAt: new Date(),
      deletedAt: null,
      id: v7(),
      name: input.name,
      position: 0,
      updatedAt: new Date(),
      userId: session.value.data.user.id,
      version: NO_ROW_VERSION,
    };
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() =>
          $trpc.room.category.createRoomCategory.mutate({ ...input, id: roomCategory.id }),
        );
        return {
          arrivals: [createArrival(roomCategoryTable, result)],
          confirmed: createRoomCategoryConfirmations(rowVersions),
        };
      },
      { entry: getCreateRoomCategoryEntry(roomCategory), onError: createErrorAlert },
    );
  };
  const deleteRoomCategory = (id: DeleteRoomCategoryInput) => {
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() =>
          $trpc.room.category.deleteRoomCategory.mutate(id),
        );
        return {
          arrivals: [createArrival(roomCategoryTable, result)],
          confirmed: createRoomCategoryConfirmations(rowVersions),
        };
      },
      { entry: getDeleteRoomCategoryEntry(id, new Date()), onError: createErrorAlert },
    );
  };
  // Only the categories the server holds take a position: a placeholder has none to give, and it is listed after them
  const reorderRoomCategories = (newRoomCategories: RoomCategoryInMessage[]) => {
    const updates = getRoomCategoryPositionUpdates(
      newRoomCategories.filter(({ version }) => version !== NO_ROW_VERSION),
    );
    if (updates.length === 0) return;

    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() =>
          $trpc.room.category.reorderRoomCategories.mutate(updates),
        );
        return {
          arrivals: result.map((roomCategory) => createArrival(roomCategoryTable, roomCategory)),
          confirmed: createRoomCategoryConfirmations(rowVersions),
        };
      },
      { entry: getReorderRoomCategoriesEntry(updates), onError: createErrorAlert },
    );
  };

  return { arriveRoomCategories, createRoomCategory, deleteRoomCategory, reorderRoomCategories, roomCategories };
});
