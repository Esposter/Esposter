ALTER TABLE `messages` ADD `webhookDeliveryId` text;--> statement-breakpoint
CREATE UNIQUE INDEX `messagesWebhookDeliveryIdIndex` ON `messages` (`webhookDeliveryId`);