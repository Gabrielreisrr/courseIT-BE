import { PrismaClient, ProgressStatus } from "@prisma/client";
import { enrollmentService } from "./enrollmentService";

const prisma = new PrismaClient();

class ProgressService {
  async updateProgress(
    userId: string,
    lessonId: string,
    status: ProgressStatus
  ) {
    // Get the lesson's course to verify enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const courseId = lesson.module.courseId;
    const isEnrolled = await enrollmentService.isEnrolled(userId, courseId);

    if (!isEnrolled) {
      throw new Error("User is not enrolled in this course");
    }

    // Update or create progress
    return prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        status,
      },
      create: {
        userId,
        lessonId,
        status,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    });
  }

  async getUserProgress(userId: string, courseId: string) {
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          include: {
            progress: {
              where: { userId },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return modules.map((module) => ({
      moduleId: module.id,
      moduleTitle: module.title,
      lessons: module.lessons.map((lesson) => ({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        status: lesson.progress[0]?.status || ProgressStatus.NOT_STARTED,
      })),
    }));
  }

  async getModuleProgress(userId: string, moduleId: string) {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      include: {
        progress: {
          where: { userId },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return lessons.map((lesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      status: lesson.progress[0]?.status || ProgressStatus.NOT_STARTED,
    }));
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const progress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    });

    return (
      progress || {
        userId,
        lessonId,
        status: ProgressStatus.NOT_STARTED,
      }
    );
  }

  async calculateCourseProgress(userId: string, courseId: string) {
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          include: {
            progress: {
              where: {
                userId,
                status: ProgressStatus.COMPLETED,
              },
            },
          },
        },
      },
    });

    let totalLessons = 0;
    let completedLessons = 0;

    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        totalLessons++;
        if (lesson.progress.length > 0) {
          completedLessons++;
        }
      });
    });

    return {
      totalLessons,
      completedLessons,
      progressPercentage:
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    };
  }
}

export const progressService = new ProgressService();
