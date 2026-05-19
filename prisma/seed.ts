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

  // 기존 프로젝트 upsert (shareToken 기준)
  const project = await prisma.project.upsert({
    where: { shareToken: "sample-token-0001" },
    update: {},
    create: {
      userId: user.id,
      name: "바르미 신축공사",
      siteName: "대구 수성구 바르미",
      startDate: new Date("2024-08-01"),
      endDate: new Date("2025-04-30"),
      shareToken: "sample-token-0001",
    },
  });

  // 기존 공종 전체 삭제 후 재생성 (seed 반복 실행 대비)
  await prisma.workItem.deleteMany({ where: { projectId: project.id } });

  // ─────────────────────────────────────────
  // 대분류 1: 건축공사 (77.92%)
  // ─────────────────────────────────────────
  const cat1 = await prisma.workItem.create({
    data: {
      projectId: project.id,
      parentId: null,
      code: "01",
      name: "건축공사",
      weight: 0.7792,
      sortOrder: 1,
    },
  });

  // 소분류 — 비율은 카테고리 내 상대비율 (합계 = 1.0)
  // 기준: XLS 보할값 / 0.7792
  await prisma.workItem.createMany({
    data: [
      {
        projectId: project.id, parentId: cat1.id,
        code: "010101", name: "철거공사", weight: 0.1823,
        plannedStart: new Date("2024-08-01"), plannedEnd: new Date("2024-09-30"),
        actualProgress: 100, sortOrder: 1,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010102", name: "가설공사", weight: 0.0218,
        plannedStart: new Date("2024-08-01"), plannedEnd: new Date("2025-04-30"),
        actualProgress: 72, sortOrder: 2,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010103", name: "토공사", weight: 0.0016,
        plannedStart: new Date("2024-08-15"), plannedEnd: new Date("2024-10-15"),
        actualProgress: 100, sortOrder: 3,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010104", name: "철근콘크리트공사", weight: 0.0255,
        plannedStart: new Date("2024-09-01"), plannedEnd: new Date("2025-01-31"),
        actualProgress: 85, sortOrder: 4,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010105", name: "조적공사", weight: 0.0271,
        plannedStart: new Date("2024-10-01"), plannedEnd: new Date("2025-02-28"),
        actualProgress: 60, sortOrder: 5,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010106", name: "방수공사", weight: 0.0416,
        plannedStart: new Date("2024-11-01"), plannedEnd: new Date("2025-02-28"),
        actualProgress: 50, sortOrder: 6,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010107", name: "타일공사", weight: 0.0157,
        plannedStart: new Date("2024-12-01"), plannedEnd: new Date("2025-03-31"),
        actualProgress: 20, sortOrder: 7,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010108", name: "석공사", weight: 0.1074,
        plannedStart: new Date("2024-10-01"), plannedEnd: new Date("2025-03-31"),
        actualProgress: 40, sortOrder: 8,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010109", name: "금속공사", weight: 0.1290,
        plannedStart: new Date("2024-11-01"), plannedEnd: new Date("2025-04-15"),
        actualProgress: 32, sortOrder: 9,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010110", name: "창호공사", weight: 0.1357,
        plannedStart: new Date("2024-11-15"), plannedEnd: new Date("2025-04-15"),
        actualProgress: 25, sortOrder: 10,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010111", name: "유리공사", weight: 0.0394,
        plannedStart: new Date("2024-12-01"), plannedEnd: new Date("2025-04-15"),
        actualProgress: 10, sortOrder: 11,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010112", name: "미장공사", weight: 0.0757,
        plannedStart: new Date("2025-01-01"), plannedEnd: new Date("2025-04-15"),
        actualProgress: 15, sortOrder: 12,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010113", name: "수장공사", weight: 0.1101,
        plannedStart: new Date("2025-01-15"), plannedEnd: new Date("2025-04-25"),
        actualProgress: 10, sortOrder: 13,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010114", name: "도장공사", weight: 0.0345,
        plannedStart: new Date("2025-02-01"), plannedEnd: new Date("2025-04-25"),
        actualProgress: 0, sortOrder: 14,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010115", name: "기타공사", weight: 0.0505,
        plannedStart: new Date("2024-08-01"), plannedEnd: new Date("2025-04-30"),
        actualProgress: 35, sortOrder: 15,
      },
      {
        projectId: project.id, parentId: cat1.id,
        code: "010116", name: "품질시험비", weight: 0.0023,
        plannedStart: new Date("2024-08-01"), plannedEnd: new Date("2025-04-30"),
        actualProgress: 50, sortOrder: 16,
      },
    ],
  });

  // ─────────────────────────────────────────
  // 대분류 2: 부대공사 (22.08%)
  // ─────────────────────────────────────────
  const cat2 = await prisma.workItem.create({
    data: {
      projectId: project.id,
      parentId: null,
      code: "02",
      name: "부대공사",
      weight: 0.2208,
      sortOrder: 2,
    },
  });

  await prisma.workItem.createMany({
    data: [
      {
        projectId: project.id, parentId: cat2.id,
        code: "020101", name: "샌드위치 패널 교체공사", weight: 0.0172,
        plannedStart: new Date("2024-08-01"), plannedEnd: new Date("2024-10-31"),
        actualProgress: 100, sortOrder: 1,
      },
      {
        projectId: project.id, parentId: cat2.id,
        code: "020102", name: "드라이비트 교체공사", weight: 0.1136,
        plannedStart: new Date("2024-09-01"), plannedEnd: new Date("2024-12-31"),
        actualProgress: 80, sortOrder: 2,
      },
      {
        projectId: project.id, parentId: cat2.id,
        code: "020103", name: "우천통로 설치공사", weight: 0.8692,
        plannedStart: new Date("2024-08-01"), plannedEnd: new Date("2025-04-30"),
        actualProgress: 40, sortOrder: 3,
      },
    ],
  });

  console.log("✅ Seed 완료");
  console.log(`   이메일: admin@example.com`);
  console.log(`   비밀번호: admin1234`);
  console.log(`   프로젝트: 바르미 신축공사 (공종 19개)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
