import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  machines,
  InsertMachine,
  maintenanceSchedules,
  InsertMaintenanceSchedule,
  maintenanceHistory,
  InsertMaintenanceHistory,
  maintenanceFiles,
  InsertMaintenanceFile,
  alerts,
  InsertAlert
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Machinery queries
export async function createMachine(data: InsertMachine) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(machines).values(data);
  return result;
}

export async function getMachinesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(machines).where(eq(machines.userId, userId));
}

export async function getMachineById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(machines).where(eq(machines.id, id)).limit(1);
  return result[0];
}

export async function updateMachine(id: number, data: Partial<InsertMachine>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(machines).set(data).where(eq(machines.id, id));
}

export async function deleteMachine(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(maintenanceFiles).where(eq(maintenanceFiles.maintenanceHistoryId, id));
  await db.delete(maintenanceHistory).where(eq(maintenanceHistory.machineId, id));
  await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.machineId, id));
  await db.delete(alerts).where(eq(alerts.machineId, id));
  return await db.delete(machines).where(eq(machines.id, id));
}

// Maintenance Schedule queries
export async function createMaintenanceSchedule(data: InsertMaintenanceSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(maintenanceSchedules).values(data);
}

export async function getScheduleByMachineId(machineId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.machineId, machineId)).limit(1);
  return result[0];
}

export async function updateMaintenanceSchedule(machineId: number, data: Partial<InsertMaintenanceSchedule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(maintenanceSchedules).set(data).where(eq(maintenanceSchedules.machineId, machineId));
}

// Maintenance History queries
export async function createMaintenanceHistory(data: InsertMaintenanceHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(maintenanceHistory).values(data);
  return result;
}

export async function getMaintenanceHistoryByMachineId(machineId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceHistory).where(eq(maintenanceHistory.machineId, machineId));
}

export async function deleteMaintenanceHistory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(maintenanceFiles).where(eq(maintenanceFiles.maintenanceHistoryId, id));
  return await db.delete(maintenanceHistory).where(eq(maintenanceHistory.id, id));
}

// Maintenance Files queries
export async function createMaintenanceFile(data: InsertMaintenanceFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(maintenanceFiles).values(data);
}

export async function getFilesByMaintenanceHistoryId(maintenanceHistoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceFiles).where(eq(maintenanceFiles.maintenanceHistoryId, maintenanceHistoryId));
}

// Alerts queries
export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(alerts).values(data);
}

export async function getAlertsByMachineIds(machineIds: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (machineIds.length === 0) return [];
  const { inArray } = await import("drizzle-orm");
  return await db.select().from(alerts).where(inArray(alerts.machineId, machineIds));
}

export async function markAlertAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(alerts).set({ isRead: 1 }).where(eq(alerts.id, id));
}

export async function getAllSchedulesWithMachines() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceSchedules);
}
