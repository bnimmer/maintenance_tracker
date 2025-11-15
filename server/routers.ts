import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createMachine,
  getMachinesByUserId,
  getMachineById,
  updateMachine,
  deleteMachine,
  createMaintenanceSchedule,
  getScheduleByMachineId,
  updateMaintenanceSchedule,
  createMaintenanceHistory,
  getMaintenanceHistoryByMachineId,
  deleteMaintenanceHistory,
  createMaintenanceFile,
  getFilesByMaintenanceHistoryId,
  createAlert,
  getAlertsByMachineIds,
  markAlertAsRead,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  machines: router({
    create: protectedProcedure
      .input(z.object({
        machineId: z.string(),
        name: z.string(),
        location: z.string().optional(),
        description: z.string().optional(),
        intervalDays: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { intervalDays, ...machineData } = input;
        const result = await createMachine({ ...machineData, userId: ctx.user.id });
        const machineId = Number((result as any).insertId);
        
        if (intervalDays) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + intervalDays);
          await createMaintenanceSchedule({
            machineId,
            intervalDays,
            lastMaintenanceDate: new Date(),
            nextMaintenanceDate: nextDate,
          });
        }
        
        return { success: true, machineId };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getMachinesByUserId(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMachineById(input.id);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        machineId: z.string().optional(),
        name: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateMachine(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMachine(input.id);
        return { success: true };
      }),
  }),

  schedule: router({
    get: protectedProcedure
      .input(z.object({ machineId: z.number() }))
      .query(async ({ input }) => {
        return await getScheduleByMachineId(input.machineId);
      }),
    update: protectedProcedure
      .input(z.object({
        machineId: z.number(),
        intervalDays: z.number(),
        lastMaintenanceDate: z.date().optional(),
        nextMaintenanceDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { machineId, ...data } = input;
        const existing = await getScheduleByMachineId(machineId);
        
        if (existing) {
          await updateMaintenanceSchedule(machineId, data);
        } else {
          await createMaintenanceSchedule({ machineId, ...data });
        }
        
        return { success: true };
      }),
  }),

  history: router({
    create: protectedProcedure
      .input(z.object({
        machineId: z.number(),
        maintenanceDate: z.date(),
        maintenanceType: z.string(),
        notes: z.string().optional(),
        technicianName: z.string().optional(),
        files: z.array(z.object({
          fileKey: z.string(),
          fileUrl: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
          fileSize: z.number(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { files, ...historyData } = input;
        const result = await createMaintenanceHistory({ ...historyData, userId: ctx.user.id });
        const historyId = Number((result as any).insertId);
        
        if (files && files.length > 0) {
          for (const file of files) {
            await createMaintenanceFile({ ...file, maintenanceHistoryId: historyId });
          }
        }
        
        const schedule = await getScheduleByMachineId(input.machineId);
        if (schedule) {
          const nextDate = new Date(input.maintenanceDate);
          nextDate.setDate(nextDate.getDate() + schedule.intervalDays);
          await updateMaintenanceSchedule(input.machineId, {
            lastMaintenanceDate: input.maintenanceDate,
            nextMaintenanceDate: nextDate,
          });
        }
        
        return { success: true, historyId };
      }),
    list: protectedProcedure
      .input(z.object({ machineId: z.number() }))
      .query(async ({ input }) => {
        const history = await getMaintenanceHistoryByMachineId(input.machineId);
        const historyWithFiles = await Promise.all(
          history.map(async (h) => {
            const files = await getFilesByMaintenanceHistoryId(h.id);
            return { ...h, files };
          })
        );
        return historyWithFiles;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMaintenanceHistory(input.id);
        return { success: true };
      }),
  }),

  alerts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const machines = await getMachinesByUserId(ctx.user.id);
      const machineIds = machines.map(m => m.id);
      return await getAlertsByMachineIds(machineIds);
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markAlertAsRead(input.id);
        return { success: true };
      }),
    checkOverdue: protectedProcedure.mutation(async ({ ctx }) => {
      const machines = await getMachinesByUserId(ctx.user.id);
      const now = new Date();
      let alertsCreated = 0;
      
      for (const machine of machines) {
        const schedule = await getScheduleByMachineId(machine.id);
        if (schedule && schedule.nextMaintenanceDate && schedule.nextMaintenanceDate < now) {
          const existingAlerts = await getAlertsByMachineIds([machine.id]);
          const hasOverdueAlert = existingAlerts.some(
            a => a.alertType === 'overdue' && a.isRead === 0
          );
          
          if (!hasOverdueAlert) {
            await createAlert({
              machineId: machine.id,
              alertType: 'overdue',
              message: `Maintenance overdue for ${machine.name} (${machine.machineId})`,
              isRead: 0,
            });
            alertsCreated++;
          }
        }
      }
      
      return { success: true, alertsCreated };
    }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const machines = await getMachinesByUserId(ctx.user.id);
      const now = new Date();
      const upcomingDays = 7;
      const upcomingDate = new Date(now);
      upcomingDate.setDate(upcomingDate.getDate() + upcomingDays);
      
      let overdueCount = 0;
      let upcomingCount = 0;
      
      for (const machine of machines) {
        const schedule = await getScheduleByMachineId(machine.id);
        if (schedule && schedule.nextMaintenanceDate) {
          if (schedule.nextMaintenanceDate < now) {
            overdueCount++;
          } else if (schedule.nextMaintenanceDate <= upcomingDate) {
            upcomingCount++;
          }
        }
      }
      
      const machineIds = machines.map(m => m.id);
      const alerts = await getAlertsByMachineIds(machineIds);
      const unreadAlerts = alerts.filter(a => a.isRead === 0).length;
      
      return {
        totalMachines: machines.length,
        overdueCount,
        upcomingCount,
        unreadAlerts,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
