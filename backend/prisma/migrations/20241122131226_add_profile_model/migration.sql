-- CreateTable
CREATE TABLE "profile" (
    "user_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "profile_photo" TEXT,
    "job_experience" JSONB,
    "skills" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
