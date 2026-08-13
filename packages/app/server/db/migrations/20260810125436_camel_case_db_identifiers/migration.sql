ALTER TYPE "achievement_name" RENAME TO "achievementName";--> statement-breakpoint
ALTER TYPE "resource_type" RENAME TO "resourceType";--> statement-breakpoint
ALTER TYPE "word_filter_action" RENAME TO "wordFilterAction";--> statement-breakpoint
ALTER TYPE "mime_category" RENAME TO "mimeCategory";--> statement-breakpoint
ALTER TYPE "room_type" RENAME TO "roomType";--> statement-breakpoint
ALTER TYPE "azure_container" RENAME TO "azureContainer";--> statement-breakpoint
ALTER TYPE "storage_tier" RENAME TO "storageTier";--> statement-breakpoint
ALTER TYPE "noise_suppression_mode" RENAME TO "noiseSuppressionMode";--> statement-breakpoint
ALTER TYPE "voice_input_mode" RENAME TO "voiceInputMode";--> statement-breakpoint
ALTER TYPE "user_status" RENAME TO "userStatus";--> statement-breakpoint
ALTER TYPE "notification_type" RENAME TO "notificationType";--> statement-breakpoint
ALTER TABLE "message"."call_sessions" RENAME TO "callSessions";--> statement-breakpoint
ALTER TABLE "resource_accesses" RENAME TO "resourceAccesses";--> statement-breakpoint
ALTER TABLE "resource_favorites" RENAME TO "resourceFavorites";--> statement-breakpoint
ALTER TABLE "resource_publications" RENAME TO "resourcePublications";--> statement-breakpoint
ALTER TABLE "storage_blobs" RENAME TO "storageBlobs";--> statement-breakpoint
ALTER TABLE "message"."appUsers" RENAME CONSTRAINT "app_users_name_length_check" TO "appUsers_name_length_check";--> statement-breakpoint
ALTER TABLE "blocks" RENAME CONSTRAINT "no_self_block" TO "blocks_blockerId_blockedId_check";--> statement-breakpoint
ALTER TABLE "message"."callSessions" RENAME CONSTRAINT "call_sessions_id_length_check" TO "callSessions_id_length_check";--> statement-breakpoint
ALTER TABLE "friendRequests" RENAME CONSTRAINT "no_self_friend_request" TO "friendRequests_senderId_receiverId_check";--> statement-breakpoint
ALTER TABLE "friends" RENAME CONSTRAINT "no_self_friendship" TO "friends_senderId_receiverId_check";--> statement-breakpoint
ALTER TABLE "message"."invites" RENAME CONSTRAINT "invites_max_uses_check" TO "invites_maxUses_check";--> statement-breakpoint
ALTER TABLE "message"."invites" RENAME CONSTRAINT "invites_uses_max_uses_check" TO "invites_uses_maxUses_check";--> statement-breakpoint
ALTER TABLE "message"."roomCategories" RENAME CONSTRAINT "room_categories_name_length_check" TO "roomCategories_name_length_check";--> statement-breakpoint
ALTER TABLE "message"."roomCategories" RENAME CONSTRAINT "room_categories_position_check" TO "roomCategories_position_check";--> statement-breakpoint
ALTER TABLE "message"."roomFilters" RENAME CONSTRAINT "room_filters_words_size_check" TO "roomFilters_words_size_check";--> statement-breakpoint
ALTER TABLE "message"."roomFilters" RENAME CONSTRAINT "room_filters_timeout_duration_check" TO "roomFilters_action_timeoutDurationMs_check";--> statement-breakpoint
ALTER TABLE "message"."roomRoles" RENAME CONSTRAINT "room_roles_color_length_check" TO "roomRoles_color_length_check";--> statement-breakpoint
ALTER TABLE "message"."roomRoles" RENAME CONSTRAINT "room_roles_name_length_check" TO "roomRoles_name_length_check";--> statement-breakpoint
ALTER TABLE "message"."roomRoles" RENAME CONSTRAINT "room_roles_position_check" TO "roomRoles_position_check";--> statement-breakpoint
ALTER TABLE "message"."rooms" RENAME CONSTRAINT "participant_key_type" TO "rooms_type_participantKey_check";--> statement-breakpoint
ALTER TABLE "message"."rooms" RENAME CONSTRAINT "rooms_max_file_size_bytes_check" TO "rooms_maxFileSizeBytes_check";--> statement-breakpoint
ALTER TABLE "message"."rooms" RENAME CONSTRAINT "rooms_slowmode_ms_check" TO "rooms_slowmodeMs_check";--> statement-breakpoint
ALTER TABLE "message"."scheduledMessageJobs" RENAME CONSTRAINT "scheduled_message_jobs_payload_type_check" TO "scheduledMessageJobs_payload_type_check";--> statement-breakpoint
ALTER TABLE "message"."searchHistories" RENAME CONSTRAINT "search_histories_query_length_check" TO "searchHistories_query_length_check";--> statement-breakpoint
ALTER TABLE "storageBlobs" RENAME CONSTRAINT "storage_blobs_declared_bytes_check" TO "storageBlobs_declaredBytes_check";--> statement-breakpoint
ALTER TABLE "storageBlobs" RENAME CONSTRAINT "storage_blobs_counted_bytes_check" TO "storageBlobs_countedBytes_check";--> statement-breakpoint
ALTER TABLE "userAchievements" RENAME CONSTRAINT "user_achievements_amount_check" TO "userAchievements_amount_check";--> statement-breakpoint
ALTER TABLE "message"."userSettings" RENAME CONSTRAINT "user_settings_input_sensitivity_decibels_check" TO "userSettings_inputSensitivityDecibels_check";--> statement-breakpoint
ALTER TABLE "message"."userSettings" RENAME CONSTRAINT "user_settings_microphone_volume_percentage_check" TO "userSettings_microphoneVolumePercentage_check";--> statement-breakpoint
ALTER TABLE "message"."userSettings" RENAME CONSTRAINT "user_settings_speaker_volume_percentage_check" TO "userSettings_speakerVolumePercentage_check";--> statement-breakpoint
ALTER TABLE "message"."userSettings" RENAME CONSTRAINT "user_settings_auto_idle_threshold_ms_check" TO "userSettings_autoIdleThresholdMs_check";--> statement-breakpoint
ALTER TABLE "message"."userSettings" RENAME CONSTRAINT "user_settings_push_to_talk_release_delay_ms_check" TO "userSettings_pushToTalkReleaseDelayMs_check";--> statement-breakpoint
ALTER TABLE "message"."userStatuses" RENAME CONSTRAINT "user_statuses_message_length_check" TO "userStatuses_message_length_check";--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" RENAME CONSTRAINT "users_to_rooms_nickname_length_check" TO "usersToRooms_nickname_length_check";--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" RENAME CONSTRAINT "users_to_rooms_mention_count_check" TO "usersToRooms_mentionCount_check";--> statement-breakpoint
ALTER INDEX "friend_requests_receiverId_index" RENAME TO "friendRequests_receiverId_index";--> statement-breakpoint
ALTER INDEX "friend_requests_senderId_index" RENAME TO "friendRequests_senderId_index";--> statement-breakpoint
ALTER INDEX "resource_accesses_userId_accessedAt_index" RENAME TO "resourceAccesses_userId_accessedAt_index";--> statement-breakpoint
ALTER INDEX "message"."room_roles_roomId_position_index" RENAME TO "roomRoles_roomId_position_index";--> statement-breakpoint
ALTER INDEX "message"."room_roles_everyone_unique" RENAME TO "roomRoles_roomId_isEveryone_unique";--> statement-breakpoint
ALTER INDEX "message"."scheduled_message_jobs_userId_roomId_runAt_index" RENAME TO "scheduledMessageJobs_userId_roomId_runAt_index";--> statement-breakpoint
ALTER INDEX "storage_blobs_userId_reconciledAt_index" RENAME TO "storageBlobs_userId_reconciledAt_index";--> statement-breakpoint
ALTER INDEX "message"."users_to_room_roles_roleId_index" RENAME TO "usersToRoomRoles_roleId_index";--> statement-breakpoint
ALTER INDEX "message"."users_to_room_roles_roomId_index" RENAME TO "usersToRoomRoles_roomId_index";--> statement-breakpoint
ALTER INDEX "message"."users_to_rooms_timeout_until_index" RENAME TO "usersToRooms_timeoutUntil_index";--> statement-breakpoint
ALTER TABLE "message"."pushSubscriptions" RENAME CONSTRAINT "push_subscriptions_endpoint_userId_unique" TO "pushSubscriptions_endpoint_userId_unique";