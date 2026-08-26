<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { validate } from "@/services/router/validate";
import { useCommentStore } from "@/store/post/comment";

definePageMeta({ validate });

const { data: session } = await authClient.useSession(useFetch);
// A comment is a post, so this is the same page rerooted when the route names one — the thread below it reads
// The same way, and the comment renders at depth zero rather than at the depth it is stored with
const post = await useReadPostFromRoute();
const commentStore = useCommentStore();
const { currentPost } = storeToRefs(commentStore);
currentPost.value = post;
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ post.title }}</Title>
    </Head>
    <v-container v-if="currentPost" flex flex-1 flex-col h-full>
      <v-row flex-none>
        <v-col>
          <PostCard :post="currentPost" is-comment-store />
        </v-col>
      </v-row>
      <v-row flex-1 flex-col>
        <v-col flex flex-1 flex-col>
          <StyledCard flex-1>
            <v-container v-if="session">
              <PostCommentCreateRichTextEditor :parent-id="currentPost.id" />
            </v-container>
            <v-container>
              <PostCommentEmptyBanner v-if="currentPost.noComments === 0" />
              <!-- The route's post is a branch like any other, so the page mounts the same component a reply ten
              levels down does -->
              <PostCommentBranch v-else :parent-id="currentPost.id" :depth="0" />
            </v-container>
          </StyledCard>
        </v-col>
      </v-row>
      <PostConfirmDeleteDialog />
      <PostCommentConfirmDeleteDialog />
    </v-container>
  </NuxtLayout>
</template>
