ALTER TABLE `users` ADD `public_shelf_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `public_shelf_enabled` text DEFAULT '0' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_public_shelf_token` ON `users` (`public_shelf_token`);