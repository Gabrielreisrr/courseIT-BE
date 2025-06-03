import { PrismaClient } from "@prisma/client";
import { CreateModuleInput, UpdateModuleInput } from "../schemas/module.schema";

const prisma = new PrismaClient();

class ModuleService {
  async create(data: CreateModuleInput) {
    return prisma.module.create({
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
      },
    });
  }

  async update(moduleId: string, data: UpdateModuleInput) {
    return prisma.module.update({
      where: { id: moduleId },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
      },
    });
  }

  async delete(moduleId: string) {
    return prisma.module.delete({
      where: { id: moduleId },
    });
  }

  async findById(moduleId: string) {
    return prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  async findByCourse(courseId: string) {
    return prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  async isCourseAuthor(moduleId: string, userId: string): Promise<boolean> {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            authorId: true,
          },
        },
      },
    });
    return module?.course.authorId === userId;
  }
}

export const moduleService = new ModuleService();
