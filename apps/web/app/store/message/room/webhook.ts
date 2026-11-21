import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { DeleteWebhookInput } from "#shared/models/db/webhook/DeleteWebhookInput";
import type { RegenerateTokenInput } from "#shared/models/db/webhook/RegenerateTokenInput";
import type { UpdateWebhookInput } from "#shared/models/db/webhook/UpdateWebhookInput";
import type {
  IssuedWebhookInMessage,
  PublicWebhookInMessage,
  RoomInMessage,
  WebhookInMessageWithRelations,
} from "@esposter/db-schema";
import type { Except } from "type-fest";

import { webhookTable } from "#src/services/message/room/overlay/constants";
import { getWebhookPatchEntry } from "#src/services/message/room/overlay/getWebhookPatchEntry";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useWebhookDialogStore } from "#src/store/message/room/webhookDialog";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

export const useWebhookStore = defineStore("message/room/webhook", () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const roomStore = useRoomStore();
  const webhookDialogStore = useWebhookDialogStore();
  const overlayStore = useOverlayStore();
  const { view, writeAwaited, writeOptimistic } = overlayStore;
  const webhookRows = view(webhookTable);
  // The room the screen is scoped to, with its live webhooks, newest first as the server lists them. The view leaves a
  // Deleted webhook's tombstone out
  const items = computed(() =>
    webhookRows.value
      .filter(
        (webhook): webhook is PublicWebhookInMessage =>
          webhook.roomId === roomStore.scopedRoomId && checkIsVersioned(webhook),
      )
      .toSorted((firstWebhook, secondWebhook) => secondWebhook.id.localeCompare(firstWebhook.id)),
  );
  // The credential is answered once, by the write that issues it, and is shown in its own dialog until that closes
  const showIssuedUrl = ({ token, webhook }: IssuedWebhookInMessage) => {
    webhookDialogStore.issuedUrl = `${runtimeConfig.public.baseUrl}/api/webhooks/${webhook.id}/${token}`;
  };
  const readWebhookRows = useOverlayRead(webhookTable, (webhook: WebhookInMessageWithRelations) => webhook);
  const readWebhooks = (roomId: RoomInMessage["id"]) =>
    readWebhookRows(() => $trpc.webhook.readWebhooks.query({ roomId }));
  // The create's answer is the server's to mint, so it is shown once the server issues it. Its pending state is the
  // Dialog's button, which no entry can show for a write that has none
  const isCreateWebhookPending = ref(false);
  const createWebhook = async (roomId: RoomInMessage["id"], input: Except<CreateWebhookInput, "roomId">) => {
    isCreateWebhookPending.value = true;
    await withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            const issuedWebhook = await $trpc.webhook.createWebhook.mutate({ ...input, roomId });
            showIssuedUrl(issuedWebhook);
            return [createArrival(webhookTable, issuedWebhook.webhook)];
          },
          { onError: createErrorAlert },
        ),
      () => {
        isCreateWebhookPending.value = false;
      },
    );
  };
  // Only the fields this write names change, so a rename and an active switch compose on the row they both show
  const updateWebhook = (roomId: RoomInMessage["id"], input: Except<UpdateWebhookInput, "roomId">) => {
    writeOptimistic(
      async () => createRowResponse(webhookTable, await $trpc.webhook.updateWebhook.mutate({ ...input, roomId })),
      {
        entry: getWebhookPatchEntry(input.id, {
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.name !== undefined && { name: input.name }),
        }),
        onError: createErrorAlert,
      },
    );
  };
  // The token is the server's to mint, and the URL that carries it is shown once the server issues it
  const regenerateToken = async (roomId: RoomInMessage["id"], input: Except<RegenerateTokenInput, "roomId">) => {
    await writeAwaited(
      async () => {
        const regeneratedWebhook = await $trpc.webhook.regenerateToken.mutate({ ...input, roomId });
        showIssuedUrl(regeneratedWebhook);
        return [createArrival(webhookTable, regeneratedWebhook.webhook)];
      },
      { onError: createErrorAlert },
    );
  };
  const deleteWebhook = (roomId: RoomInMessage["id"], input: Except<DeleteWebhookInput, "roomId">) => {
    writeOptimistic(
      async () => createRowResponse(webhookTable, await $trpc.webhook.deleteWebhook.mutate({ ...input, roomId })),
      { entry: getWebhookPatchEntry(input.id, { deletedAt: new Date() }), onError: createErrorAlert },
    );
  };
  return { createWebhook, deleteWebhook, isCreateWebhookPending, items, readWebhooks, regenerateToken, updateWebhook };
});
