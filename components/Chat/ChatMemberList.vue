<script setup lang="ts">
import { ChatMember } from "@components/Chat/types";

interface Props {
  chatMembers: ChatMember[];
}

const { chatMembers } = defineProps<Props>();
</script>

<template>
  <v-list>
    <template v-for="(member, index) in chatMembers" :key="index">
      <v-list-item>
        <template #prepend>
          <v-badge color="green" dot>
            <v-list-item-avatar>
              <v-img :src="member.avatar" />
            </v-list-item-avatar>
          </v-badge>
        </template>
        {{ member.username }}
      </v-list-item>
    </template>
  </v-list>
</template>
