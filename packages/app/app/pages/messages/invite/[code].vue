<script setup lang="ts">
import { selectInviteSchema } from "#shared/db/schema/invites";
import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { authClient } from "@/services/auth/authClient";
import { NotFoundError } from "@esposter/shared";

definePageMeta({
  middleware: "auth",
  validate: async (route) => {
    const code = route.params.code;
    const result = await selectInviteSchema.shape.code.safeParseAsync(code);
    return result.success;
  },
});

const { data: session } = await authClient.useSession(useFetch);
const { $trpc } = useNuxtApp();
const route = useRoute();
const code = route.params.code as string;
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/3493
const invite = await $trpc.room.readInvite.query(code);
if (!invite)
  throw createError({
    message: new NotFoundError(DatabaseEntityType.Invite, `${code}, the code may have expired`).message,
    statusCode: 404,
  });
else if (invite.room.usersToRooms.some(({ userId }) => userId === session.value?.user.id))
  await navigateTo(RoutePath.MessagesInvite(invite.roomId));
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
            <v-avatar v-if="invite.user.image" size="6rem">
              <v-img :src="invite.user.image" :alt="invite.user.name" />
            </v-avatar>
            <StyledDefaultAvatar v-else :name="invite.user.name" />
          </v-card-title>
          <v-card-text>
            <div text-center>
              You've been invited to join
              <span font-bold>
                {{ invite.room.name }}
              </span>
              by
              <div text-2xl font-bold>
                {{ invite.user.name }}
              </div>
              <div>
                {{ invite.room.usersToRooms.length }} Member{{ invite.room.usersToRooms.length === 1 ? "" : "s" }}
              </div>
            </div>
          </v-card-text>
          <v-card-actions w-full>
            <StyledButton
              w-full
              @click="
                async () => {
                  const code = $route.params.code;
                  if (typeof code !== 'string') return;
                  const userToRoom = await $trpc.room.joinRoom.mutate(code);
                  if (!userToRoom) return;
                  await navigateTo(RoutePath.MessagesInvite(userToRoom.roomId));
                }
              "
            >
              Accept Invite
            </StyledButton>
          </v-card-actions>
        </StyledCard>
      </v-dialog>
    </VisualSpaceBackground>
  </NuxtLayout>
</template>
