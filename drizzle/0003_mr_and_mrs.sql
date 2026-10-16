CREATE TABLE "guesses" (
	"guest_id" text NOT NULL,
	"n" integer NOT NULL,
	"value" text NOT NULL,
	"points" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guesses_guest_id_n_pk" PRIMARY KEY("guest_id","n")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"n" integer PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"answer" text,
	"multi" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;