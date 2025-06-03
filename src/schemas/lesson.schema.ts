import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  videoUrl: z.string().url().optional(),
  moduleId: z.string().uuid(),
  order: z.number().int().min(0),
});

export const updateLessonSchema = createLessonSchema.partial();

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
