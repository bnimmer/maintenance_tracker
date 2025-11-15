import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Machinery tables
export const machines = mysqlTable("machines", {
  id: int("id").autoincrement().primaryKey(),
  machineId: varchar("machineId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const maintenanceSchedules = mysqlTable("maintenance_schedules", {
  id: int("id").autoincrement().primaryKey(),
  machineId: int("machineId").notNull(),
  intervalDays: int("intervalDays").notNull(),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const maintenanceHistory = mysqlTable("maintenance_history", {
  id: int("id").autoincrement().primaryKey(),
  machineId: int("machineId").notNull(),
  maintenanceDate: timestamp("maintenanceDate").notNull(),
  maintenanceType: varchar("maintenanceType", { length: 100 }).notNull(),
  notes: text("notes"),
  technicianName: varchar("technicianName", { length: 255 }),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const maintenanceFiles = mysqlTable("maintenance_files", {
  id: int("id").autoincrement().primaryKey(),
  maintenanceHistoryId: int("maintenanceHistoryId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  machineId: int("machineId").notNull(),
  alertType: varchar("alertType", { length: 50 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = typeof machines.$inferInsert;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;
export type InsertMaintenanceSchedule = typeof maintenanceSchedules.$inferInsert;
export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type InsertMaintenanceHistory = typeof maintenanceHistory.$inferInsert;
export type MaintenanceFile = typeof maintenanceFiles.$inferSelect;
export type InsertMaintenanceFile = typeof maintenanceFiles.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;