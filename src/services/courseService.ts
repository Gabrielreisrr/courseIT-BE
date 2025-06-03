import { PrismaClient } from "@prisma/client";
import { CreateCourseInput, UpdateCourseInput } from "../schemas/course.schema";

const prisma = new PrismaClient();

class CourseService {
  async create(authorId: string, data: CreateCourseInput) {
    return prisma.course.create({
      data: {
        ...data,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(courseId: string, data: UpdateCourseInput) {
    return prisma.course.update({
      where: { id: courseId },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(courseId: string) {
    return prisma.course.delete({
      where: { id: courseId },
    });
  }

  async findById(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  async findAll() {
    return prisma.course.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }

  async isAuthor(courseId: string, userId: string): Promise<boolean> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    return course?.authorId === userId;
  }
}

export const courseService = new CourseService();
