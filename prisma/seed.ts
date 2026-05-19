import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      name: "홍길동 소장",
    },
  });

  const project = await prisma.project.upsert({
    where: { shareToken: "sample-token-0001" },
    update: {},
    create: {
      userId: user.id,
      name: "바르미 신축공사",
      siteName: "대구 수성구 바르미",
      startDate: new Date("2024-08-01"),
      endDate: new Date("2025-04-30"),
      shareToken: uuidv4(),
    },
  });

  // 대분류 1: 가설공사
  const cat1 = await prisma.workItem.create({
    data: {
      projectId: project.id,
      parentId: null,
      code: "01",
      name: "가설공사",
      weight: 0.05,
      sortOrder: 1,
    },
  });

  await prisma.workItem.createMany({
    data: [
      {
        projectId: project.id,
        parentId: cat1.id,
        code: "010101",
        name: "안전관리비",
        weight: 0.017,
        plannedStart: new Date("2024-08-01"),
        plannedEnd: new Date("2025-04-30"),
        actualProgress: 30,
        sortOrder: 1,
      },
      {
        projectId: project.id,
        parentId: cat1.id,
        code: "010102",
        name: "가설울타리",
        weight: 0.012,
        plannedStart: new Date("2024-08-01"),
        plannedEnd: new Date("2024-09-30"),
        actualProgress: 100,
        sortOrder: 2,
      },
    ],
  });

  // 대분류 2: 토공사
  const cat2 = await prisma.workItem.create({
    data: {
      projectId: project.id,
      parentId: null,
      code: "02",
      name: "토공사",
      weight: 0.1,
      sortOrder: 2,
    },
  });

  await prisma.workItem.createMany({
    data: [
      {
        projectId: project.id,
        parentId: cat2.id,
        code: "020101",
        name: "터파기",
        weight: 0.05,
        plannedStart: new Date("2024-08-15"),
        plannedEnd: new Date("2024-10-15"),
        actualProgress: 80,
        sortOrder: 1,
      },
      {
        projectId: project.id,
        parentId: cat2.id,
        code: "020102",
        name: "되메우기",
        weight: 0.03,
        plannedStart: new Date("2024-10-01"),
        plannedEnd: new Date("2024-11-30"),
        actualProgress: 20,
        sortOrder: 2,
      },
    ],
  });

  console.log("✅ Seed 완료");
  console.log(`   이메일: admin@example.com`);
  console.log(`   비밀번호: admin1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
