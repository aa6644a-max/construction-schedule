"use client";

interface Section {
  title: string;
  content: React.ReactNode;
}

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "red" | "gray" | "yellow" | "green" }) {
  const cls = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    red: "bg-red-100 text-red-600 border-red-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    green: "bg-green-100 text-green-700 border-green-200",
  }[color];
  return (
    <span className={`inline-block border text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {num}
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 leading-relaxed">
      {children}
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 leading-relaxed">
      {children}
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

export default function HelpGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 개요 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-7 text-white">
        <h1 className="text-2xl font-bold mb-2">공정표 관리 시스템 사용 설명서</h1>
        <p className="text-blue-100 text-sm leading-relaxed">
          건설 현장의 공정 계획 수립, 진도 관리, 산재보험 보할 계산을 하나의 시스템에서 처리합니다.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge color="blue">간트 차트</Badge>
          <Badge color="blue">공종 관리</Badge>
          <Badge color="blue">보할 계산</Badge>
          <Badge color="blue">PDF 내보내기</Badge>
          <Badge color="blue">공유 링크</Badge>
        </div>
      </div>

      {/* 전체 흐름 */}
      <SectionCard title="전체 사용 흐름" icon="🗺️">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {["로그인", "→", "대시보드", "→", "프로젝트 생성", "→", "공종 등록", "→", "간트 차트 확인", "→", "진도 입력", "→", "PDF 출력"].map((t, i) => (
            <span
              key={i}
              className={t === "→" ? "text-gray-300 font-bold" : "bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium"}
            >
              {t}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* 로그인 */}
      <SectionCard title="1. 로그인" icon="🔐">
        <div className="space-y-3">
          <Step num={1}>사이트 접속 시 로그인 화면으로 이동합니다.</Step>
          <Step num={2}>
            이메일과 비밀번호를 입력하고 <strong>로그인</strong> 버튼을 누릅니다.
            <div className="mt-2 bg-gray-50 rounded-lg px-4 py-3 text-xs font-mono text-gray-600 border border-gray-200">
              기본 계정: admin@example.com / admin1234
            </div>
          </Step>
          <Step num={3}>로그인 성공 시 대시보드로 이동합니다.</Step>
        </div>
      </SectionCard>

      {/* 대시보드 */}
      <SectionCard title="2. 대시보드 — 현장 목록" icon="🏗️">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">로그인 후 가장 먼저 보이는 화면입니다. 내가 등록한 모든 현장(프로젝트) 목록이 카드 형태로 표시됩니다.</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">+ 새 프로젝트</p>
              <p className="text-gray-500">오른쪽 상단 버튼 클릭 → 공사명, 현장명, 착공일, 준공예정일 입력 후 생성</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">프로젝트 삭제</p>
              <p className="text-gray-500">카드 위 삭제 버튼 클릭 → 확인 메시지 후 삭제 (복구 불가)</p>
            </div>
          </div>

          <Step num={1}>
            <strong>+ 새 프로젝트</strong> 버튼 클릭
          </Step>
          <Step num={2}>팝업창에서 정보 입력<br />
            <span className="text-gray-500">· 공사명: 예) 바르미 신축공사<br />
            · 현장명: 예) 대구 수성구 바르미<br />
            · 착공일 / 준공예정일 선택</span>
          </Step>
          <Step num={3}><strong>생성</strong> 버튼 클릭 → 카드 목록에 추가됨</Step>
          <Step num={4}>카드 클릭 → 해당 프로젝트 상세 화면 진입</Step>
        </div>
      </SectionCard>

      {/* 공종 관리 */}
      <SectionCard title="3. 공종 관리 탭" icon="📋">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            간트 차트에 표시될 공종(작업 항목)을 등록합니다. <strong>반드시 공종 등록 후 간트 차트를 사용하세요.</strong>
          </p>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">구조: 2단계 계층</p>
            <div className="flex gap-3 text-sm">
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">대분류 (카테고리)</p>
                <p className="text-gray-500">가설공사, 토공사, 철근콘크리트 등<br />전체 공사에서의 비율(%) 설정</p>
                <div className="mt-2"><Badge color="gray">날짜 없음</Badge></div>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-bold text-gray-800 mb-1">소분류 (세부 공종)</p>
                <p className="text-gray-500">안전관리비, 터파기, 되메우기 등<br />카테고리 내 비율(%) + 날짜 설정</p>
                <div className="mt-2"><Badge color="blue">날짜 필수</Badge></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">대분류 추가 방법</p>
            <Step num={1}>구분 선택란에서 <strong>대분류 (새 카테고리)</strong> 선택</Step>
            <Step num={2}>코드 입력 (예: <code className="bg-gray-100 px-1 rounded">01</code>), 공종명, 전체 비율(%) 입력</Step>
            <Step num={3}><strong>+ 추가</strong> 클릭</Step>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">소분류 추가 방법</p>
            <Step num={1}>구분 선택란에서 <strong>↳ 해당 대분류명</strong> 선택</Step>
            <Step num={2}>코드 (예: <code className="bg-gray-100 px-1 rounded">010101</code>), 공종명, 카테고리 내 비율(%), 예정 시작일·종료일 입력</Step>
            <Step num={3}><strong>+ 추가</strong> 클릭</Step>
          </div>

          <WarnBox>
            <strong>비율(%) 합계 주의</strong><br />
            · 대분류 전체 비율 합계 = <strong>100%</strong>가 되어야 합니다.<br />
            · 소분류의 카테고리 내 비율 합계도 <strong>100%</strong>가 되어야 합니다.<br />
            · 합계가 맞지 않으면 상단에 노란색 경고가 표시됩니다.
          </WarnBox>

          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">수정 / 삭제</p>
            <p>· 각 행 오른쪽 <strong>수정</strong> 버튼 → 인라인 편집 후 <strong>저장</strong></p>
            <p>· <strong>삭제</strong> 버튼 → 대분류 삭제 시 하위 소분류 모두 삭제됨 (주의)</p>
          </div>
        </div>
      </SectionCard>

      {/* 간트 차트 */}
      <SectionCard title="4. 간트 차트 탭" icon="📊">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            공종별 예정·실적 일정을 시각적으로 확인하고, 실제 진도를 직접 입력합니다.
          </p>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <div className="w-10 h-4 bg-blue-300 rounded mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-gray-700">예정공정</p>
              <p className="text-gray-400 text-xs mt-1">파란색 바</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <div className="w-6 h-4 bg-red-400 rounded mx-auto mb-2 opacity-90" />
              <p className="font-semibold text-gray-700">실적공정</p>
              <p className="text-gray-400 text-xs mt-1">빨간색 바 (실제 진도만큼)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <div className="border-l-2 border-red-400 border-dashed h-4 w-0 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">오늘</p>
              <p className="text-gray-400 text-xs mt-1">빨간 점선</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">주요 기능</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex gap-3 items-start">
                <Badge color="gray">보기 단위</Badge>
                <span>오른쪽 상단 <strong>일 / 주 / 월</strong> 버튼으로 타임라인 단위 변경</span>
              </div>
              <div className="flex gap-3 items-start">
                <Badge color="gray">접기/펼치기</Badge>
                <span>대분류 이름 클릭 → ▶/▼ 토글로 소분류 숨기기/보이기</span>
              </div>
              <div className="flex gap-3 items-start">
                <Badge color="gray">진도 입력</Badge>
                <span>소분류 행 오른쪽 빨간 숫자(%) 클릭 → 숫자 직접 입력 → Enter 또는 클릭 밖 저장 (0~100)</span>
              </div>
              <div className="flex gap-3 items-start">
                <Badge color="gray">전체 진행률</Badge>
                <span>상단 파란 진행 바 — 각 공종의 비율·진도를 가중평균하여 자동 계산</span>
              </div>
            </div>
          </div>

          <InfoBox>
            전체 진행률 = 각 대분류 비율 × (소분류 진도의 가중평균) 을 모두 합산한 값입니다.
            소분류 진도를 정확히 입력해야 올바른 전체 진행률이 계산됩니다.
          </InfoBox>
        </div>
      </SectionCard>

      {/* 보할 계산 */}
      <SectionCard title="5. 보할 계산 탭" icon="🧮">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            공종별 산재보험료를 자동 계산합니다. 고용노동부 고시 기준 노무비율·산재보험요율을 내장하고 있습니다.
          </p>

          <div className="space-y-3">
            <Step num={1}><strong>전체 공사금액</strong> 입력 (원 단위, 콤마 없이 숫자만)</Step>
            <Step num={2}>
              공종 선택 → 해당 공종 금액 입력 → <strong>+ 추가</strong><br />
              <span className="text-gray-500 text-xs">· Enter 키로도 추가 가능<br />
              · 재료비 등 보험료 비산정 항목은 <strong>공제항목</strong> 체크 후 추가</span>
            </Step>
            <Step num={3}>결과 테이블에서 공종별 노무비·산재보험료 자동 확인</Step>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">출력값 ①</p>
              <p className="font-bold text-gray-800">전체 노무비</p>
              <p className="text-gray-400 text-xs mt-1">공종금액 × 노무비율</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-500 text-xs mb-1">출력값 ②</p>
              <p className="font-bold text-blue-800">가중평균 산재요율</p>
              <p className="text-blue-400 text-xs mt-1">= 총 산재보험료 ÷ 총 노무비</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">출력값 ③</p>
              <p className="font-bold text-gray-800">예상 산재보험료</p>
              <p className="text-gray-400 text-xs mt-1">노무비 × 산재요율 합산</p>
            </div>
          </div>

          <WarnBox>
            내장 요율은 일반적 기준값입니다. 실제 신고 전 반드시 고용노동부 홈페이지에서
            해당 연도 고시 요율을 확인하세요.
          </WarnBox>
        </div>
      </SectionCard>

      {/* 공유 및 PDF */}
      <SectionCard title="6. 공유 링크 & PDF 내보내기" icon="🔗">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">공유 링크</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>· <strong>공유 링크 복사</strong> 버튼 → 클립보드에 URL 복사</p>
                <p>· 링크를 받은 사람은 <strong>로그인 없이</strong> 간트 차트를 열람 가능</p>
                <p>· 열람자는 진도 수정 불가 (읽기 전용)</p>
                <p>· <strong>링크 재발급</strong> 버튼 → 기존 링크 무효화 후 새 링크 생성</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">PDF 내보내기</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>· <strong>PDF 내보내기</strong> 버튼 클릭</p>
                <p>· 간트 차트 탭 화면이 A3 가로 PDF로 저장</p>
                <p>· 파일명: <code className="bg-gray-100 px-1 rounded text-xs">공사명_현장명_공정표_날짜.pdf</code></p>
                <p>· PDF 출력 전 <strong>간트 차트 탭</strong>에서 보기 단위를 조정하면 원하는 범위로 출력 가능</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 프로젝트 수정 */}
      <SectionCard title="7. 프로젝트 정보 수정" icon="✏️">
        <div className="space-y-3 text-sm text-gray-600">
          <p>프로젝트 화면 상단 <strong>프로젝트 수정</strong> 버튼을 클릭하면 수정 화면으로 이동합니다.</p>
          <p>· 공사명, 현장명, 착공일, 준공예정일 변경 가능</p>
          <p>· 착공일/준공예정일 변경 시 간트 차트 기간도 자동으로 재조정됩니다.</p>
        </div>
      </SectionCard>

      {/* 권장 작업 순서 */}
      <SectionCard title="권장 작업 순서 (신규 현장)" icon="✅">
        <div className="space-y-2">
          {[
            "대시보드에서 새 프로젝트 생성 (공사명, 현장명, 착·준공일)",
            "공종 관리 탭 → 대분류 등록 (비율 합계 100% 확인)",
            "공종 관리 탭 → 각 대분류 아래 소분류 등록 (날짜 + 비율)",
            "간트 차트 탭 → 일정 확인 및 보기 단위 조정",
            "현장 진행에 따라 간트 차트에서 소분류 진도(%) 입력",
            "필요 시 PDF 내보내기 또는 공유 링크 전달",
            "보할 계산 탭 → 산재보험료 계산 후 확인",
          ].map((text, i) => (
            <Step key={i} num={i + 1}>{text}</Step>
          ))}
        </div>
      </SectionCard>

      <div className="text-center text-xs text-gray-400 py-4">
        공정표 관리 시스템 — 문의사항은 관리자에게 연락하세요.
      </div>
    </div>
  );
}
