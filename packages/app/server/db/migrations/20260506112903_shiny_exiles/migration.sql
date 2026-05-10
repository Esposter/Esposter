ALTER TABLE "accounts" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "deleted_at" TO "deletedAt";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "access_token" TO "accessToken";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "access_token_expires_at" TO "accessTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "account_id" TO "accountId";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "id_token" TO "idToken";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "provider_id" TO "providerId";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "refresh_token" TO "refreshToken";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "refresh_token_expires_at" TO "refreshTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "deleted_at" TO "deletedAt";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "expires_at" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "ip_address" TO "ipAddress";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "user_agent" TO "userAgent";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "deleted_at" TO "deletedAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "email_verified" TO "emailVerified";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "deleted_at" TO "deletedAt";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "expires_at" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "rate_limiter_flexible" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rate_limiter_flexible" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "rate_limiter_flexible" ADD COLUMN "updatedAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "deletedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "deletedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "deletedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "updatedAt" SET NOT NULL;