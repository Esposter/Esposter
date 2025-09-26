CREATE TABLE "rate_limiter_flexible" (
	"expire" timestamp,
	"key" text PRIMARY KEY NOT NULL,
	"points" integer NOT NULL
);
