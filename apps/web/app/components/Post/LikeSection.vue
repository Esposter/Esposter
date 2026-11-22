<script setup lang="ts">
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { authClient } from "#src/services/auth/authClient";

interface Props {
  post: PostInPostWithRelations;
}

defineProps<Props>();
// The synchronous form, as the comment card's is: a feed renders one of these per post, and the awaited one would make
// Each of them an async boundary for something that only gates the votes. A guest sees the score and none of the votes,
// Since the server refuses a vote from a guest
const session = authClient.useSession();
</script>

<template>
  <!-- Reddit's vote pill: both directions and the score between them on one track, each vote clear until it is cast -->
  <div flex items-center ui-field ui-pill>
    <PostVoteButton v-if="session.data" :post :value="1" />
    <span text-center min-w-6>{{ post.likeCount }}</span>
    <PostVoteButton v-if="session.data" :post :value="-1" />
  </div>
</template>
