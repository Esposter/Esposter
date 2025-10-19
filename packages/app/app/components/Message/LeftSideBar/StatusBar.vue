<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useStatusStore } from "@/store/message/user/status";

const { data: session } = await authClient.useSession(useFetch);
const statusStore = useStatusStore();
const { getStatusEnum } = statusStore;
</script>

<template>
  <div v-if="session" px-2 pb-2>
    <StyledCard flex p-2 rd-2>
      <MessageModelMemberStatusAvatar :id="session.user.id" :image="session.user.image" :name="session.user.name" />
      <div w-full flex justify-between>
        <div pl-2 flex flex-col justify-center>
          <div class="text-xs">
            {{ session.user.name }}
          </div>
          <div class="text-xs text-gray">
            {{ getStatusEnum(session.user.id) }}
          </div>
        </div>
        <div flex>
          <MessageLeftSideBarSettingsDialogButton />
        </div>
      </div>
    </StyledCard>
  </div>
</template>
