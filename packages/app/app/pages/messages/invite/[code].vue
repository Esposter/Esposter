<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useRoomStore } from "@/store/message/room";
import { requireRouteParam } from "@/util/router/requireRouteParam";
import { DatabaseEntityType, selectInviteInMessageSchema } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const code = route.params.code;
    const result = await selectInviteInMessageSchema.shape.id.safeParseAsync(code);
    return result.success;
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
const { joinRoom } = roomStore;
// The dialog is the page, so it is open from its first render — and an overlay born open before its mount has
// No root for Vuetify's block scroll strategy to read, which throws and takes the page with it. See StyledDialog
const isMounted = useMounted();
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Invite</Title>
    </Head>
    <VisualSpaceBackground>
      <v-dialog :model-value="isMounted" persistent no-click-animation :scrim="false">
        <StyledCard p-8 bg-background items-center>
          <v-card-title>
            <StyledAvatar :image="invite.user.image" :name="invite.user.name" :avatar-props="{ size: '6rem' }" />
          </v-card-title>
          <v-card-text>
            <div text-center>
              You've been invited to join
              <span font-bold>
                {{ invite.roomInMessage.name }}
              </span>
              by
              <div font-bold text-headline-small>
                {{ invite.user.name }}
              </div>
              <div>
                {{ invite.roomInMessage.usersToRoomsInMessage.length }} Member{{
                  invite.roomInMessage.usersToRoomsInMessage.length === 1 ? "" : "s"
                }}
              </div>
            </div>
          </v-card-text>
          <v-card-actions w-full>
            <StyledButton w-full :button-props="{ text: 'Accept Invite' }" @click="joinRoom(code)" />
          </v-card-actions>
        </StyledCard>
      </v-dialog>
    </VisualSpaceBackground>
  </NuxtLayout>
</template>
