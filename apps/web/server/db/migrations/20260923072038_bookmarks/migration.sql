CREATE TABLE "bookmarks" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"path" text,
	"title" text NOT NULL,
	"userId" text,
	CONSTRAINT "bookmarks_pkey" PRIMARY KEY("userId","path"),
	CONSTRAINT "bookmarks_path_length_check" CHECK (LENGTH("path") <= 2048),
	CONSTRAINT "bookmarks_title_length_check" CHECK (LENGTH("title") <= 100)
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;