<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsSent/DraftItem";
import type { DraftsSentSection } from "@/models/message/draftsSent/DraftsSentSection";
import type { ScheduledMessageJobWithRoom } from "@/models/message/draftsSent/ScheduledMessageJobWithRoom";
import type { ScheduleDraftsSentTarget } from "@/models/message/draftsSent/ScheduleDraftsSentTarget";
import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { DraftsSentTab } from "@/models/message/draftsSent/DraftsSentTab";
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { MessageType, ScheduledMessageJobType } from "@esposter/db-schema";
import { getIsServer, RoutePath, withFinalizerAsync } from "@esposter/shared";
import { mergeProps } from "vue";

definePageMeta({ middleware: "auth" });

const { $trpc } = useNuxtApp();
const tab = ref(DraftsSentTab.Drafts);
const inputStore = useInputStore();
const { clearDraft, getDraft, getDraftUpdatedAt, storeDraft } = inputStore;
const { draftRoomIds } = storeToRefs(inputStore);
const dataStore = useDataStore();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const scheduledMessageJobs = ref<ScheduledMessageJobWithRoom[]>([]);
const scheduledMessageJobCount = ref(0);
const scheduledMessageJobsOffset = ref(0);
const hasMoreScheduledMessageJobs = ref(false);
const isScheduledMessageJobsPending = ref(true);
const scheduleTarget = ref<ScheduleDraftsSentTarget>();
const scheduledAt = ref(dayjs().add(1, "minute").toDate());
const minScheduledAt = ref(scheduledAt.value);
const isScheduleDialogOpen = computed({
  get: () => Boolean(scheduleTarget.value),
  set: (value) => {
    if (!value) scheduleTarget.value = undefined;
  },
});
const roomById = computed(() => new Map(rooms.value.map((room) => [room.id, room])));
const draftItems = computed(() =>
  [...draftRoomIds.value]
    .map((roomId) => {
      const room = roomById.value.get(roomId);
      if (!room) return undefined;
      return {
        content: getDraft(roomId),
        room,
        updatedAt: getDraftUpdatedAt(roomId) ?? room.updatedAt,
      };
    })
    .filter((draftItem): draftItem is DraftItem => Boolean(draftItem))
    .toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)),
);
const groupedDraftItems = computed(() => getGroupedTimelineItems(draftItems.value, ({ updatedAt }) => updatedAt));
const groupedScheduledMessageJobs = computed(() =>
  getGroupedTimelineItems(scheduledMessageJobs.value, ({ runAt }) => runAt),
);
const readScheduledMessageJobs = async () => {
  const [data, count] = await Promise.all([
    $trpc.message.scheduledMessageJob.readMyScheduledJobs.query(),
    $trpc.message.scheduledMessageJob.readMyScheduledJobsCount.query(),
  ]);
  scheduledMessageJobs.value = data.items;
  scheduledMessageJobCount.value = count;
  scheduledMessageJobsOffset.value = data.items.length;
  hasMoreScheduledMessageJobs.value = data.hasMore;
  isScheduledMessageJobsPending.value = false;
};
const readMoreScheduledMessageJobs = async (onComplete: () => void) => {
  const data = await $trpc.message.scheduledMessageJob.readMyScheduledJobs.query({
    offset: scheduledMessageJobsOffset.value,
  });
  scheduledMessageJobs.value.push(...data.items);
  scheduledMessageJobsOffset.value += data.items.length;
  hasMoreScheduledMessageJobs.value = data.hasMore;
  onComplete();
};
const removeScheduledMessageJob = (id: ScheduledMessageJobInMessage["id"]) => {
  scheduledMessageJobs.value = scheduledMessageJobs.value.filter(
    (scheduledMessageJob) => scheduledMessageJob.id !== id,
  );
  scheduledMessageJobsOffset.value = Math.max(0, scheduledMessageJobsOffset.value - 1);
  scheduledMessageJobCount.value = Math.max(0, scheduledMessageJobCount.value - 1);
};
const cancelScheduledMessageJob = async ({ id }: ScheduledMessageJobWithRoom) => {
  await $trpc.message.scheduledMessageJob.cancelScheduledJob.mutate({ id });
  removeScheduledMessageJob(id);
};
const setDefaultScheduledAt = () => {
  scheduledAt.value = dayjs().add(1, "minute").toDate();
  minScheduledAt.value = new Date(scheduledAt.value);
};
const openScheduleDialog = (target: ScheduleDraftsSentTarget) => {
  setDefaultScheduledAt();
  scheduleTarget.value = target;
};
const editDraft = async ({ room }: DraftItem) => {
  await navigateTo(RoutePath.Messages(room.id));
};
const sendDraft = async ({ content, room }: DraftItem) => {
  await dataStore.createMessage({ files: [], message: content, roomId: room.id, type: MessageType.Message });
  clearDraft(room.id);
};
const editScheduledMessageJob = async (scheduledMessageJob: ScheduledMessageJobWithRoom) => {
  storeDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
  await cancelScheduledMessageJob(scheduledMessageJob);
  await navigateTo(RoutePath.Messages(scheduledMessageJob.roomId));
};
const sendScheduledMessageJob = async (scheduledMessageJob: ScheduledMessageJobWithRoom) => {
  const { payload, roomId } = scheduledMessageJob;
  if (payload.type !== ScheduledMessageJobType.ScheduledMessage) return;
  await dataStore.createMessage({ files: [], message: payload.message, roomId, type: MessageType.Message });
  await cancelScheduledMessageJob(scheduledMessageJob);
};
const cancelScheduledMessageJobToDraft = async (scheduledMessageJob: ScheduledMessageJobWithRoom) => {
  storeDraft(scheduledMessageJob.roomId, getScheduledMessageJobText(scheduledMessageJob));
  await cancelScheduledMessageJob(scheduledMessageJob);
};
const getSectionTitle = (date: Date) => {
  if (dayjs(date).isToday()) return "Today";
  if (dayjs(date).isYesterday()) return "Yesterday";
  return dayjs(date).format("dddd, D MMMM");
};
const getGroupedTimelineItems = <TItem>(items: TItem[], getDate: (item: TItem) => Date): DraftsSentSection<TItem>[] => {
  const sectionMap = new Map<string, DraftsSentSection<TItem>>();
  for (const item of items) {
    const title = getSectionTitle(getDate(item));
    const section = sectionMap.get(title) ?? { items: [], title };
    section.items.push(item);
    sectionMap.set(title, section);
  }
  return [...sectionMap.values()];
};
const getScheduledMessageJobText = ({ payload }: ScheduledMessageJobWithRoom) =>
  payload.type === ScheduledMessageJobType.Reminder ? payload.text : payload.message;
const getScheduledMessageJobIcon = ({ payload }: ScheduledMessageJobWithRoom) =>
  payload.type === ScheduledMessageJobType.Reminder ? "mdi-bell-outline" : "mdi-send-clock";
const getDisplayTime = (date: Date) => dayjs(date).format("h:mm A");
const getTextFromHtml = (html: string) => {
  if (getIsServer()) return html;
  const element = window.document.createElement("div");
  element.innerHTML = html;
  return element.textContent ?? "";
};

await readScheduledMessageJobs();
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div bg-surface flex flex-col h-full min-h-0>
      <div px-6 pt-5>
        <h1 font-bold text-headline-small>Drafts & sent</h1>
        <v-tabs v-model="tab" mt-4>
          <v-tab :value="DraftsSentTab.Drafts">
            <span>Drafts</span>
            <template v-if="draftItems.length">
              <v-icon icon="mdi-pencil" ml-1 size="x-small" />
              <span>{{ draftItems.length }}</span>
            </template>
          </v-tab>
          <v-tab :value="DraftsSentTab.Scheduled">
            <span>Scheduled</span>
            <template v-if="scheduledMessageJobCount">
              <v-icon icon="mdi-clock-outline" ml-1 size="x-small" />
              <span>{{ scheduledMessageJobCount }}</span>
            </template>
          </v-tab>
          <v-tab :value="DraftsSentTab.Sent">Sent</v-tab>
        </v-tabs>
      </div>
      <v-divider />
      <div p-6 flex-1 min-h-0 overflow-y-auto>
        <v-window v-model="tab">
          <v-window-item :value="DraftsSentTab.Drafts">
            <div v-if="draftItems.length" flex flex-col gap-y-6>
              <section v-for="{ items, title } of groupedDraftItems" :key="title">
                <div font-bold mb-3>{{ title }}</div>
                <v-list b-1 b-border rd-lg b-solid>
                  <v-hover v-for="draftItem of items" :key="draftItem.room.id" #default="{ isHovering, props }">
                    <v-list-item :="props" @click="navigateTo(RoutePath.Messages(draftItem.room.id))">
                      <template #prepend>
                        <StyledAvatar :image="draftItem.room.image" :name="draftItem.room.name" />
                      </template>
                      <v-list-item-title font-bold>{{ draftItem.room.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span v-html="draftItem.content" />
                      </v-list-item-subtitle>
                      <template #append>
                        <div flex gap-x-3 items-center>
                          <span op-medium-emphasis text-body-small>{{ getDisplayTime(draftItem.updatedAt) }}</span>
                          <div v-show="isHovering" p-1 b-1 b-border rd-lg b-solid bg-surface flex items-center>
                            <StyledDeleteFormDialog
                              :card-props="{
                                title: 'Delete draft',
                                text: 'Are you sure you want to delete this draft?',
                              }"
                              @delete="
                                (onComplete) => {
                                  clearDraft(draftItem.room.id);
                                  onComplete();
                                }
                              "
                            >
                              <template #activator="{ updateIsOpen }">
                                <v-tooltip text="Delete draft">
                                  <template #activator="{ props: tooltipProps }">
                                    <v-btn
                                      :="tooltipProps"
                                      density="comfortable"
                                      icon="mdi-delete-outline"
                                      size="small"
                                      variant="text"
                                      @click.stop="updateIsOpen(true)"
                                    />
                                  </template>
                                </v-tooltip>
                              </template>
                            </StyledDeleteFormDialog>
                            <v-tooltip text="Edit draft">
                              <template #activator="{ props: tooltipProps }">
                                <v-btn
                                  :="tooltipProps"
                                  density="comfortable"
                                  icon="mdi-pencil-outline"
                                  size="small"
                                  variant="text"
                                  @click.stop="editDraft(draftItem)"
                                />
                              </template>
                            </v-tooltip>
                            <v-tooltip text="Schedule message">
                              <template #activator="{ props: tooltipProps }">
                                <v-btn
                                  :="tooltipProps"
                                  density="comfortable"
                                  icon="mdi-clock-plus-outline"
                                  size="small"
                                  variant="text"
                                  @click.stop="
                                    openScheduleDialog({
                                      content: draftItem.content,
                                      roomId: draftItem.room.id,
                                    })
                                  "
                                />
                              </template>
                            </v-tooltip>
                            <v-tooltip text="Send message">
                              <template #activator="{ props: tooltipProps }">
                                <v-btn
                                  :="tooltipProps"
                                  density="comfortable"
                                  icon="mdi-send-outline"
                                  size="small"
                                  variant="text"
                                  @click.stop="sendDraft(draftItem)"
                                />
                              </template>
                            </v-tooltip>
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                  </v-hover>
                </v-list>
              </section>
            </div>
            <div v-else text-center flex flex-col h-full items-center justify-center>
              <v-icon icon="mdi-pencil" size="5rem" text-primary />
              <h2 font-bold mt-4 text-title-large>No drafts</h2>
            </div>
          </v-window-item>
          <v-window-item :value="DraftsSentTab.Scheduled">
            <div v-if="scheduledMessageJobs.length" flex flex-col gap-y-6>
              <section v-for="{ items, title } of groupedScheduledMessageJobs" :key="title">
                <div font-bold mb-3>{{ title }}</div>
                <v-list b-1 b-border rd-lg b-solid>
                  <v-hover
                    v-for="scheduledMessageJob of items"
                    :key="scheduledMessageJob.id"
                    #default="{ isHovering, props }"
                  >
                    <v-list-item :="props" @click="navigateTo(RoutePath.Messages(scheduledMessageJob.roomId))">
                      <template #prepend>
                        <v-avatar bg-background>
                          <v-icon :icon="getScheduledMessageJobIcon(scheduledMessageJob)" />
                        </v-avatar>
                      </template>
                      <v-list-item-title font-bold>{{ scheduledMessageJob.room.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span v-html="getScheduledMessageJobText(scheduledMessageJob)" />
                      </v-list-item-subtitle>
                      <template #append>
                        <div flex gap-x-3 items-center>
                          <span op-medium-emphasis text-body-small>{{
                            getDisplayTime(scheduledMessageJob.runAt)
                          }}</span>
                          <div v-show="isHovering" p-1 b-1 b-border rd-lg b-solid bg-surface flex items-center>
                            <v-tooltip text="Edit scheduled message">
                              <template #activator="{ props: tooltipProps }">
                                <v-btn
                                  :="tooltipProps"
                                  density="comfortable"
                                  icon="mdi-pencil-outline"
                                  size="small"
                                  variant="text"
                                  @click.stop="editScheduledMessageJob(scheduledMessageJob)"
                                />
                              </template>
                            </v-tooltip>
                            <v-tooltip text="Reschedule message">
                              <template #activator="{ props: tooltipProps }">
                                <v-btn
                                  :="tooltipProps"
                                  density="comfortable"
                                  icon="mdi-clock-edit-outline"
                                  size="small"
                                  variant="text"
                                  @click.stop="
                                    openScheduleDialog({
                                      content: getScheduledMessageJobText(scheduledMessageJob),
                                      roomId: scheduledMessageJob.roomId,
                                      scheduledMessageJobId: scheduledMessageJob.id,
                                    })
                                  "
                                />
                              </template>
                            </v-tooltip>
                            <v-tooltip text="Send message">
                              <template #activator="{ props: tooltipProps }">
                                <v-btn
                                  :="tooltipProps"
                                  :disabled="
                                    scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage
                                  "
                                  density="comfortable"
                                  icon="mdi-send-outline"
                                  size="small"
                                  variant="text"
                                  @click.stop="sendScheduledMessageJob(scheduledMessageJob)"
                                />
                              </template>
                            </v-tooltip>
                            <v-menu location="bottom end">
                              <template #activator="{ props: menuProps }">
                                <v-tooltip text="More">
                                  <template #activator="{ props: tooltipProps }">
                                    <v-btn
                                      :="mergeProps(menuProps, tooltipProps)"
                                      density="comfortable"
                                      icon="mdi-dots-vertical"
                                      size="small"
                                      variant="text"
                                      @click.stop
                                    />
                                  </template>
                                </v-tooltip>
                              </template>
                              <v-list density="compact">
                                <v-list-item
                                  title="Cancel schedule and save to drafts"
                                  @click="cancelScheduledMessageJobToDraft(scheduledMessageJob)"
                                />
                                <StyledDeleteFormDialog
                                  :card-props="{
                                    title: 'Delete message',
                                    text: 'Are you sure you want to delete this scheduled message?',
                                  }"
                                  @delete="
                                    async (onComplete) => {
                                      await withFinalizerAsync(
                                        () => cancelScheduledMessageJob(scheduledMessageJob),
                                        onComplete,
                                      );
                                    }
                                  "
                                >
                                  <template #activator="{ updateIsOpen }">
                                    <v-list-item title="Delete message" text-error @click.stop="updateIsOpen(true)" />
                                  </template>
                                </StyledDeleteFormDialog>
                              </v-list>
                            </v-menu>
                          </div>
                        </div>
                      </template>
                    </v-list-item>
                  </v-hover>
                </v-list>
              </section>
              <StyledWaypoint :is-active="hasMoreScheduledMessageJobs" @change="readMoreScheduledMessageJobs" />
            </div>
            <div
              v-else-if="!isScheduledMessageJobsPending"
              text-center
              flex
              flex-col
              h-full
              items-center
              justify-center
            >
              <v-icon icon="mdi-clock-outline" size="5rem" text-primary />
              <h2 font-bold mt-4 text-title-large>No scheduled messages</h2>
            </div>
          </v-window-item>
          <v-window-item :value="DraftsSentTab.Sent">
            <div text-center flex flex-col h-full items-center justify-center>
              <v-icon icon="mdi-send-outline" size="5rem" text-primary />
              <h2 font-bold mt-4 text-title-large>No sent messages</h2>
            </div>
          </v-window-item>
        </v-window>
      </div>
      <StyledFormDialog
        v-model="isScheduleDialogOpen"
        :card-props="{ title: scheduleTarget?.scheduledMessageJobId ? 'Reschedule Message' : 'Schedule Message' }"
        :confirm-button-props="{ prependIcon: 'mdi-send-clock', text: 'Schedule Message' }"
        :confirm-button-attrs="{ disabled: !scheduledAt }"
        @submit="
          async (_event, onComplete) => {
            await withFinalizerAsync(async () => {
              if (!scheduleTarget) return;
              await $trpc.message.scheduledMessageJob.scheduleMessage.mutate({
                message: scheduleTarget.content,
                roomId: scheduleTarget.roomId,
                runAt: scheduledAt,
              });
              if (scheduleTarget.scheduledMessageJobId) {
                await $trpc.message.scheduledMessageJob.cancelScheduledJob.mutate({
                  id: scheduleTarget.scheduledMessageJobId,
                });
                removeScheduledMessageJob(scheduleTarget.scheduledMessageJobId);
              } else {
                clearDraft(scheduleTarget.roomId);
              }
              await readScheduledMessageJobs();
              scheduleTarget = undefined;
            }, onComplete);
          }
        "
      >
        <v-container>
          <v-row>
            <v-col cols="12">
              <StyledDatePicker
                v-model="scheduledAt"
                :date-picker-props="{
                  minDate: minScheduledAt,
                  placeholder: 'Run at',
                  sixWeeks: 'append',
                }"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                :model-value="scheduleTarget ? getTextFromHtml(scheduleTarget.content) : ''"
                label="Message"
                readonly
              />
            </v-col>
          </v-row>
        </v-container>
      </StyledFormDialog>
    </div>
  </NuxtLayout>
</template>
