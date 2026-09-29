CREATE TABLE "answers" (
	"team_id" text NOT NULL,
	"station_id" integer NOT NULL,
	"question_id" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"correct" boolean,
	"appeal" text,
	CONSTRAINT "answers_team_id_station_id_question_id_pk" PRIMARY KEY("team_id","station_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" integer PRIMARY KEY NOT NULL,
	"revealed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"first_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_states" (
	"station_id" integer PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"closes_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_stations" (
	"team_id" text NOT NULL,
	"station_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"sealed_at" timestamp,
	CONSTRAINT "team_stations_team_id_station_id_pk" PRIMARY KEY("team_id","station_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_stations" ADD CONSTRAINT "team_stations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;