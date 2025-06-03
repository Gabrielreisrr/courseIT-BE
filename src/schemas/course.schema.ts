import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
