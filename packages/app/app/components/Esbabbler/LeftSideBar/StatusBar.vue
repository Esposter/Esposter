<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useUserStatusStore } from "@/store/message/userStatus";

const { data: session } = await authClient.useSession(useFetch);
const userStatusStore = useUserStatusStore();
const { getUserStatusEnum } = userStatusStore;
</script>

<template>
  <div v-if="session" px-2 pb-2>
    <StyledCard flex p-2 rd-2>
      <EsbabblerModelMemberStatusAvatar :id="session.user.id" :image="session.user.image" :name="session.user.name" />
      <div w-full flex justify-between>
        <div pl-2 flex flex-col justify-center>
          <div class="text-xs">
            {{ session.user.name }}
          </div>
          <div class="text-xs text-gray">
            {{ getUserStatusEnum(session.user.id) }}
          </div>
        </div>
        <div flex>
          <EsbabblerLeftSideBarUserSettingsDialogButton />
        </div>
      </div>
    </StyledCard>
  </div>
</template>
