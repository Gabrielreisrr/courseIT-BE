import { z } from "zod";

export const createEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
});

export const updateEnrollmentSchema = z.object({
  status: z.enum(["ENROLLED", "COMPLETED", "CANCELLED"]),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
