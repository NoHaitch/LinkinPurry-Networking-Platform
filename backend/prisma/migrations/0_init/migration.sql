-- CreateTable
CREATE TABLE "chat" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from_id" BIGINT NOT NULL,
    "to_id" BIGINT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection" (
    "from_id" BIGINT NOT NULL,
    "to_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "connection_pkey" PRIMARY KEY ("from_id","to_id")
);

-- CreateTable
CREATE TABLE "connection_request" (
    "from_id" BIGINT NOT NULL,
    "to_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "connection_request_pkey" PRIMARY KEY ("from_id","to_id")
);

-- CreateTable
CREATE TABLE "feed" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "endpoint" TEXT NOT NULL,
    "user_id" BIGINT,
    "keys" JSON NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("endpoint")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_from_id_fk_user_id" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_to_id_fk_user_id" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_from_id_fk_user_id" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_to_id_fk_user_id" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection_request" ADD CONSTRAINT "connection_request_from_id_fk_user_id" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "connection_request" ADD CONSTRAINT "connection_request_to_id_fk_user_id" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feed" ADD CONSTRAINT "feed_user_id_fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

