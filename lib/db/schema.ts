import { boolean, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🍺"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** One row per Station once the Abbots have touched it; a missing row means "sealed". */
export const stationStates = pgTable("station_states", {
  stationId: integer("station_id").primaryKey(),
  status: text("status", { enum: ["sealed", "open", "closed"] }).notNull(),
  closesAt: timestamp("closes_at"),
  closedAt: timestamp("closed_at"),
});

/** A team's progress through a Station: unlocked by the Word (or an Abbot), optionally sealed early. */
export const teamStations = pgTable(
  "team_stations",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    stationId: integer("station_id").notNull(),
    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
    sealedAt: timestamp("sealed_at"),
  },
  (t) => [primaryKey({ columns: [t.teamId, t.stationId] })],
);

export const answers = pgTable(
  "answers",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    stationId: integer("station_id").notNull(),
    questionId: text("question_id").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    /** Set when the Station closes; flipped to true if an appeal is accepted. */
    correct: boolean("correct"),
    appeal: text("appeal", { enum: ["pending", "accepted", "rejected"] }),
  },
  (t) => [primaryKey({ columns: [t.teamId, t.stationId, t.questionId] })],
);

/** Singleton row (id = 1). */
export const game = pgTable("game", {
  id: integer("id").primaryKey(),
  revealedAt: timestamp("revealed_at"),
});
