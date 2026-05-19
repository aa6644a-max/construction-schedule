"use client";

import { useState, useMemo } from "react";

interface WorkType {
  id: string;
  name: string;
  laborRatio: number;     // 노무비율 (0~1)
  insuranceRate: number;  // 산재보험요율 (0~1)
}

// 고용노동부 고시 기준 일반적 요율 (실제 적용 전 확인 필요)
const WORK_TYPES: WorkType[] = [
  { id: "gasel",  name: "가설공사",       laborRatio: 0.35, insuranceRate: 0.037 },
  { id: "to",     name: "토공사",         laborRatio: 0.28, insuranceRate: 0.035 },
  { id: "gichoo", name: "기초공사",       laborRatio: 0.25, insuranceRate: 0.037 },
  { id: "rc",     name: "철근콘크리트공사", laborRatio: 0.30, insuranceRate: 0.037 },
  { id: "steel",  name: "철골공사",       laborRatio: 0.25, insuranceRate: 0.027 },
  { id: "joak",   name: "조적공사",       laborRatio: 0.45, insuranceRate: 0.037 },
  { id: "bangsoo",name: "방수공사",       laborRatio: 0.30, insuranceRate: 0.037 },
  { id: "seok",   name: "석공사",         laborRatio: 0.40, insuranceRate: 0.037 },
  { id: "tile",   name: "타일공사",       laborRatio: 0.40, insuranceRate: 0.037 },
  { id: "mok",    name: "목공사",         laborRatio: 0.35, insuranceRate: 0.037 },
  { id: "changho",name: "창호공사",       laborRatio: 0.25, insuranceRate: 0.016 },
  { id: "dojang", name: "도장공사",       laborRatio: 0.35, insuranceRate: 0.037 },
  { id: "sujang", name: "수장공사",       laborRatio: 0.35, insuranceRate: 0.037 },
  { id: "metal",  name: "금속공사",       laborRatio: 0.30, insuranceRate: 0.016 },
  { id: "mech",   name: "기계설비공사",   laborRatio: 0.25, insuranceRate: 0.016 },
  { id: "elec",   name: "전기공사",       laborRatio: 0.30, insuranceRate: 0.013 },
  { id: "comm",   name: "통신공사",       laborRatio: 0.25, insuranceRate: 0.009 },
  { id: "fire",   name: "소방공사",       laborRatio: 0.25, insuranceRate: 0.013 },
  { id: "jogi",   name: "조경공사",       laborRatio: 0.30, insuranceRate: 0.037 },
  { id: "civil",  name: "토목공사",       laborRatio: 0.28, insuranceRate: 0.035 },
  { id: "demo",   name: "철거공사",       laborRatio: 0.40, insuranceRate: 0.037 },
  { id: "other",  name: "기타공사",       laborRatio: 0.30, insuranceRate: 0.037 },
];

interface CalcRow {
  id: string;
  workTypeId: string;
  amount: number;
  isDeduction: boolean;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function parseAmount(s: string): number {
  return Number(s.replace(/,/g, "")) || 0;
}

export default function InsuranceCalc() {
  const [totalStr, setTotalStr] = useState("");
  const [rows, setRows] = useState<CalcRow[]>([]);
  const [selTypeId, setSelTypeId] = useState(WORK_TYPES[0].id);
  const [amountStr, setAmountStr] = useState("");
  const [isDeduction, setIsDeduction] = useState(false);

  const total = parseAmount(totalStr);
  const inputAmt = parseAmount(amountStr);

  function addRow() {
    if (!inputAmt) return;
    setRows((prev) => [
      ...prev,
      { id: Date.now().toString(), workTypeId: selTypeId, amount: inputAmt, isDeduction },
    ]);
    setAmountStr("");
    setIsDeduction(false);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const computed = useMemo(() => {
    return rows.map((row) => {
      const wt = WORK_TYPES.find((w) => w.id === row.workTypeId)!;
      // 공제항목은 노무비·보험료 미산정
      const laborCost = row.isDeduction ? 0 : row.amount * wt.laborRatio;
      const premium = row.isDeduction ? 0 : laborCost * wt.insuranceRate;
      const signedAmt = row.isDeduction ? -row.amount : row.amount;
      const ratio = total > 0 ? signedAmt / total : 0;
      return { ...row, wt, laborCost, premium, signedAmt, ratio };
    });
  }, [rows, total]);

  const sumAmt      = computed.reduce((s, r) => s + r.signedAmt, 0);
  const sumLabor    = computed.reduce((s, r) => s + r.laborCost, 0);
  const sumPremium  = computed.reduce((s, r) => s + r.premium, 0);
  const blendedRate = sumLabor > 0 ? (sumPremium / sumLabor) * 100 : 0;
  const premiumVsTotal = total > 0 ? (sumPremium / total) * 100 : 0;

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* 전체 공사금액 */}
      <div className="bg-white rounded-xl border border-gray-200 p-7">
        <h3 className="text-base font-semibold text-gray-700 mb-5">산재보험료 보할 계산</h3>
        <div className="flex items-end gap-4">
          <div className="max-w-sm flex-1">
            <label className="block text-sm text-gray-500 mb-1.5">전체 공사금액 (원)</label>
            <input
              type="text"
              inputMode="numeric"
              value={totalStr}
              onChange={(e) => setTotalStr(e.target.value)}
              placeholder="예: 530339198"
              className={inputCls}
            />
          </div>
          {total > 0 && (
            <p className="text-base font-bold text-blue-600 pb-1">{fmt(total)} 원</p>
          )}
        </div>
      </div>

      {/* 공종 추가 폼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-7">
        <h3 className="text-base font-semibold text-gray-700 mb-5">공종별 금액 입력</h3>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-56">
            <label className="block text-sm text-gray-500 mb-1.5">공종</label>
            <select
              value={selTypeId}
              onChange={(e) => setSelTypeId(e.target.value)}
              className={inputCls}
            >
              {WORK_TYPES.map((wt) => (
                <option key={wt.id} value={wt.id}>
                  {wt.name} ({(wt.insuranceRate * 100).toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>

          <div className="w-52">
            <label className="block text-sm text-gray-500 mb-1.5">금액 (원)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRow()}
              placeholder="예: 9007581"
              className={inputCls}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pb-1 select-none">
            <input
              type="checkbox"
              checked={isDeduction}
              onChange={(e) => setIsDeduction(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            공제항목
          </label>

          <button
            onClick={addRow}
            disabled={!inputAmt}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            + 추가
          </button>
        </div>
      </div>

      {/* 결과 테이블 */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500">공종명</th>
                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-28">산재요율</th>
                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-28">노무비율</th>
                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-44">공종금액</th>
                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-28">비율</th>
                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-44">노무비</th>
                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-44">산재보험료</th>
                <th className="px-5 py-4 w-12" />
              </tr>
            </thead>
            <tbody>
              {computed.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    row.isDeduction ? "bg-red-50/30" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm text-gray-700">
                    {row.wt.name}
                    {row.isDeduction && (
                      <span className="ml-2 text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">공제</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-gray-500">
                    {row.isDeduction ? "-" : `${(row.wt.insuranceRate * 100).toFixed(1)}%`}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-gray-500">
                    {row.isDeduction ? "-" : `${(row.wt.laborRatio * 100).toFixed(0)}%`}
                  </td>
                  <td className={`px-5 py-3.5 text-sm text-right font-medium ${row.isDeduction ? "text-red-500" : "text-gray-800"}`}>
                    {row.isDeduction ? `▼ ${fmt(row.amount)}` : fmt(row.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-gray-500">
                    {total > 0 ? `${(row.ratio * 100).toFixed(2)}%` : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-gray-600">
                    {row.isDeduction ? "-" : fmt(row.laborCost)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-blue-600 font-medium">
                    {row.isDeduction ? "-" : fmt(row.premium)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}

              {/* 합계 행 */}
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td className="px-5 py-4 text-sm font-bold text-gray-700" colSpan={3}>합계</td>
                <td className="px-5 py-4 text-sm text-right font-bold text-gray-800">{fmt(sumAmt)}</td>
                <td className="px-5 py-4 text-sm text-right font-semibold text-gray-600">
                  {total > 0 ? `${(sumAmt / total * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-5 py-4 text-sm text-right font-bold text-gray-700">{fmt(sumLabor)}</td>
                <td className="px-5 py-4 text-sm text-right font-bold text-blue-700">{fmt(sumPremium)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 결과 카드 */}
      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-2">전체 노무비</p>
            <p className="text-2xl font-bold text-gray-800">
              {fmt(sumLabor)}
              <span className="text-sm font-normal text-gray-400 ml-1">원</span>
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <p className="text-sm text-blue-600 mb-2">가중평균 산재보험요율</p>
            <p className="text-2xl font-bold text-blue-700">
              {blendedRate.toFixed(3)}
              <span className="text-sm font-normal text-blue-400 ml-1">%</span>
            </p>
            <p className="text-xs text-blue-400 mt-1">= 산재보험료 / 전체 노무비</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-2">예상 산재보험료</p>
            <p className="text-2xl font-bold text-gray-800">
              {fmt(sumPremium)}
              <span className="text-sm font-normal text-gray-400 ml-1">원</span>
            </p>
            {total > 0 && (
              <p className="text-xs text-gray-400 mt-1">공사금액 대비 {premiumVsTotal.toFixed(3)}%</p>
            )}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {rows.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          <p className="text-base">위 폼에서 공종별 금액을 입력해주세요.</p>
          <p className="text-sm mt-1">입력 후 산재보험료가 자동 계산됩니다.</p>
        </div>
      )}

      {/* 요율 참고표 */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-600 mb-4">공종별 산재보험요율 기준표</p>
        <div className="grid grid-cols-4 gap-x-6 gap-y-2">
          {WORK_TYPES.map((wt) => (
            <div key={wt.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{wt.name}</span>
              <span className="font-semibold text-gray-700">{(wt.insuranceRate * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          ※ 위 요율은 일반적 기준이며, 실제 적용요율은 고용노동부 고시를 확인하세요.
        </p>
      </div>
    </div>
  );
}
