<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useUserStatusStore } from "@/store/esbabbler/userStatus";

const { data: session } = await authClient.useSession(useFetch);
const userStatusStore = useUserStatusStore();
const { getUserStatusEnum } = userStatusStore;
</script>

<template>
  <div px-2 pb-2>
    <StyledCard v-if="session" flex p-2>
      <EsbabblerModelMemberStatusAvatar :id="session.user.id" :image="session.user.image" :name="session.user.name" />
      <div pl-2 flex flex-col justify-center>
        <div class="text-xs">
          {{ session.user.name }}
        </div>
        <div class="text-xs text-gray">
          {{ getUserStatusEnum(session.user.id) }}
        </div>
      </div>
    </StyledCard>
  </div>
</template>
