<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { useFriendStore } from "@/store/message/user/friend";

definePageMeta({ middleware: "auth" });

const { $trpc } = useNuxtApp();
const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const { blockUser, unblockUser } = blockStore;
const friendRequestStore = useFriendRequestStore();
const { receivedFriendRequests, sentFriendRequests } = storeToRefs(friendRequestStore);
const { acceptFriendRequest, declineFriendRequest, sendFriendRequest } = friendRequestStore;
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const { deleteFriend } = friendStore;
const { readFriends } = useReadFriends();
await readFriends();

const searchQuery = ref("");
const searchResults = ref<Awaited<ReturnType<typeof $trpc.friend.searchUsers.query>>>([]);
const isSearching = ref(false);

const onSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  searchResults.value = await $trpc.friend.searchUsers.query(searchQuery.value);
  isSearching.value = false;
};

const displayFriends = computed(() => friends.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
const displayReceivedFriendRequests = computed(() =>
  receivedFriendRequests.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
);

const isFriend = (userId: string) => friends.value.some(({ id }) => id === userId);
const hasSentRequest = (userId: string) => sentFriendRequests.value.some(({ receiverId }) => receiverId === userId);
const isBlocked = (userId: string) => blockedUsers.value.some(({ id }) => id === userId);
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div class="bg-surface" flex flex-col h-full overflow-y-auto>
      <v-container>
        <div class="text-headline-small" font-bold mb-6>Friends</div>
        <div mb-8>
          <div class="text-title-large" mb-3>Add Friend</div>
          <div flex gap-2>
            <v-text-field
              v-model="searchQuery"
              placeholder="Search by name"
              hide-details
              clearable
              @input="onSearch"
              @click:clear="searchResults = []"
            />
          </div>
          <v-list v-if="searchResults.length > 0" mt-2 rounded>
            <v-list-item v-for="{ id, name, image } of searchResults" :key="id" :title="name">
              <template #prepend>
                <v-avatar size="36" mr-3>
                  <v-img v-if="image" :src="image" />
                  <span v-else>{{ name[0] }}</span>
                </v-avatar>
              </template>
              <template #append>
                <div flex gap-2>
                  <v-btn
                    v-if="!isFriend(id) && !hasSentRequest(id)"
                    text="Send Request"
                    variant="tonal"
                    size="small"
                    @click="sendFriendRequest(id)"
                  />
                  <v-chip v-else-if="hasSentRequest(id)" text="Request Sent" size="small" />
                  <v-chip v-else text="Friends" size="small" color="success" />
                  <v-btn
                    v-if="!isBlocked(id)"
                    text="Block"
                    variant="tonal"
                    color="error"
                    size="small"
                    @click="blockUser(id)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-progress-linear v-if="isSearching" indeterminate mt-2 />
        </div>
        <div v-if="displayReceivedFriendRequests.length > 0" mb-8>
          <div class="text-title-large" mb-3>Pending Requests — {{ displayReceivedFriendRequests.length }}</div>
          <v-list rounded>
            <v-list-item v-for="{ id, sender } of displayReceivedFriendRequests" :key="id" :title="sender.name">
              <template #prepend>
                <v-avatar size="36" mr-3>
                  <v-img v-if="sender.image" :src="sender.image" />
                  <span v-else>{{ sender.name[0] }}</span>
                </v-avatar>
              </template>
              <template #append>
                <div flex gap-2>
                  <v-btn
                    text="Accept"
                    variant="tonal"
                    color="success"
                    size="small"
                    @click="acceptFriendRequest(sender.id)"
                  />
                  <v-btn
                    text="Decline"
                    variant="tonal"
                    color="error"
                    size="small"
                    @click="declineFriendRequest(sender.id)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
        <div mb-8>
          <div class="text-title-large" mb-3>Friends — {{ displayFriends.length }}</div>
          <v-list v-if="displayFriends.length > 0" rounded>
            <v-list-item v-for="{ id, name, image } of displayFriends" :key="id" :title="name">
              <template #prepend>
                <v-avatar size="36" mr-3>
                  <v-img v-if="image" :src="image" />
                  <span v-else>{{ name[0] }}</span>
                </v-avatar>
              </template>
              <template #append>
                <div flex gap-2>
                  <v-btn text="Remove" variant="tonal" color="error" size="small" @click="deleteFriend(id)" />
                  <v-btn text="Block" variant="tonal" color="error" size="small" @click="blockUser(id)" />
                </div>
              </template>
            </v-list-item>
          </v-list>
          <span v-else class="text-medium-emphasis">No friends yet. Search for users above to add them.</span>
        </div>
        <div v-if="blockedUsers.length > 0">
          <div class="text-title-large" mb-3>Blocked — {{ blockedUsers.length }}</div>
          <v-list rounded>
            <v-list-item v-for="{ id, name, image } of blockedUsers" :key="id" :title="name">
              <template #prepend>
                <v-avatar size="36" mr-3>
                  <v-img v-if="image" :src="image" />
                  <span v-else>{{ name[0] }}</span>
                </v-avatar>
              </template>
              <template #append>
                <v-btn text="Unblock" variant="tonal" size="small" @click="unblockUser(id)" />
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-container>
    </div>
  </NuxtLayout>
</template>
