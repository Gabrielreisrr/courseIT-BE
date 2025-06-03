import { z } from "zod";

export const createModuleSchema = z.object({
  title: z.string().min(3).max(255),
  courseId: z.string().uuid(),
  order: z.number().int().min(0),
});

export const updateModuleSchema = createModuleSchema.partial();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
