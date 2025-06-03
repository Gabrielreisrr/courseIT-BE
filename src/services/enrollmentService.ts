import { PrismaClient, EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

class EnrollmentService {
  async enroll(userId: string, courseId: string) {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.ENROLLED,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });
  }

  async updateStatus(enrollmentId: string, status: EnrollmentStatus) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });
  }

  async getUserEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            modules: {
              select: {
                id: true,
                title: true,
                _count: {
                  select: {
                    lessons: true,
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });
  }

  async getCourseEnrollments(courseId: string) {
    return prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(enrollmentId: string) {
    return prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            authorId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
        status: EnrollmentStatus.ENROLLED,
      },
    });
    return !!enrollment;
  }

  async unenroll(enrollmentId: string) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.CANCELLED },
    });
  }
}

export const enrollmentService = new EnrollmentService();
