<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useRoomStore } from "@/store/message/room";
import { requireRouteParam } from "@/util/router/requireRouteParam";
import { DatabaseEntityType, selectInviteInMessageSchema } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const code = route.params.code;
    const parsedCode = await selectInviteInMessageSchema.shape.id.safeParseAsync(code);
    return parsedCode.success;
  },
});

const { $trpc } = useNuxtApp();
const { currentRoute } = useRouter();
const code = requireRouteParam(currentRoute.value.params, "code");
const invite = await $trpc.room.readInvite.query(code);
if (!invite)
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.Invite, code),
  });
else if (invite.isMember) await navigateTo(RoutePath.Messages(invite.roomId));

const roomStore = useRoomStore();
const { isJoinRoomPending } = storeToRefs(roomStore);
const { joinRoom } = roomStore;
</script>

<!-- The invite is the page, so it stands in the middle of it rather than in a modal over nothing: who asks, where to, how
     many are there, and the one thing to do -->
<template>
  <NuxtLayout>
    <Head>
      <Title>Invite</Title>
    </Head>
    <div p-4 flex h-full items-center justify-center ui-body>
      <section p-8 text-center flex flex-col gap-4 max-w-sm w-full items-center ui-frame>
        <UiAvatar :image="invite.user.image ?? ''" :name="invite.user.name" is-large />
        <div flex flex-col gap-1>
          <p text-muted>{{ invite.user.name }} invited you to join</p>
          <h1 ui-title>{{ invite.room.name }}</h1>
          <p text-sm text-muted>
            {{ invite.room.usersToRoomsInMessage.length }}
            {{ pluralize("Member", invite.room.usersToRoomsInMessage.length) }}
          </p>
        </div>
        <UiButton :is-pending="isJoinRoomPending" w-full :variant="UiButtonVariant.Accent" @click="joinRoom(code)">
          Accept Invite
        </UiButton>
      </section>
    </div>
  </NuxtLayout>
</template>
