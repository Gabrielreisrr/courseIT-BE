import { PrismaClient } from "@prisma/client";
import { CreateLessonInput, UpdateLessonInput } from "../schemas/lesson.schema";

const prisma = new PrismaClient();

class LessonService {
  async create(data: CreateLessonInput) {
    return prisma.lesson.create({
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                authorId: true,
              },
            },
          },
        },
      },
    });
  }

  async update(lessonId: string, data: UpdateLessonInput) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                authorId: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(lessonId: string) {
    return prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  async findById(lessonId: string) {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                authorId: true,
              },
            },
          },
        },
      },
    });
  }

  async findByModule(moduleId: string) {
    return prisma.lesson.findMany({
      where: { moduleId },
      orderBy: {
        order: "asc",
      },
    });
  }

  async isCourseAuthor(lessonId: string, userId: string): Promise<boolean> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: {
                authorId: true,
              },
            },
          },
        },
      },
    });
    return lesson?.module.course.authorId === userId;
  }
}

export const lessonService = new LessonService();
