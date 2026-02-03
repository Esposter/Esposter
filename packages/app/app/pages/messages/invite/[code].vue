<script setup lang="ts">
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType, selectInviteInMessageSchema } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const code = route.params.code;
    const result = await selectInviteInMessageSchema.shape.code.safeParseAsync(code);
    return result.success;
  },
});

const { $trpc } = useNuxtApp();
const route = useRoute();
const code = route.params.code as string;
const invite = await $trpc.room.readInvite.query(code);
if (!invite)
  // @TODO: https://github.com/nuxt/nuxt/issues/34138
  throw createError({
    status: 404,
    statusText: getEntityNotFoundStatusMessage(DatabaseEntityType.Invite, code),
  });
else if (invite.isMember) await navigateTo(RoutePath.Messages(invite.roomId));

const roomStore = useRoomStore();
const { joinRoom } = roomStore;
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Invite</Title>
    </Head>
    <VisualSpaceBackground>
      <v-dialog :model-value="true" persistent no-click-animation :scrim="false">
        <StyledCard class="bg-background" items-center p-8>
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
              <div text-2xl font-bold>
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
            <StyledButton
              w-full
              :button-props="{ text: 'Accept Invite' }"
              @click="
                async () => {
                  const code = $route.params.code;
                  if (typeof code !== 'string') return;
                  await joinRoom(code);
                }
              "
            />
          </v-card-actions>
        </StyledCard>
      </v-dialog>
    </VisualSpaceBackground>
  </NuxtLayout>
</template>
