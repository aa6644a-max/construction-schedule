"use client";

import { useState } from "react";
import { WorkItem } from "@/types/models";

interface Props {
  projectId: number;
  workItems: WorkItem[];
  onChanged: () => void;
}

interface FormState {
  parentId: string;
  code: string;
  name: string;
  weight: string; // 사용자 입력: 0~100 (%)
  plannedStart: string;
  plannedEnd: string;
}

interface EditState {
  code: string;
  name: string;
  weight: string; // 사용자 입력: 0~100 (%)
  plannedStart: string;
  plannedEnd: string;
}

const emptyForm: FormState = { parentId: "", code: "", name: "", weight: "", plannedStart: "", plannedEnd: "" };

function toDateInput(val: string | null): string {
  if (!val) return "";
  return val.slice(0, 10);
}

export default function WorkItemPanel({ projectId, workItems, onChanged }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ code: "", name: "", weight: "", plannedStart: "", plannedEnd: "" });
  const [editSaving, setEditSaving] = useState(false);

  const categories = workItems
    .filter((w) => w.parentId === null)
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  const isSubTask = form.parentId !== "";

  const catWeightSum = categories.reduce((s, c) => s + c.weight, 0);
  const catWeightWarning = categories.length > 0 && Math.abs(catWeightSum - 1) > 0.01;

  const childSumMap = new Map<number, number>();
  categories.forEach((cat) => {
    const children = workItems.filter((w) => w.parentId === cat.id);
    if (children.length > 0) childSumMap.set(cat.id, children.reduce((s, w) => s + w.weight, 0));
  });

  function startEdit(item: WorkItem) {
    setEditingId(item.id);
    setEditForm({
      code: item.code,
      name: item.name,
      weight: String((item.weight * 100).toFixed(1)),
      plannedStart: toDateInput(item.plannedStart),
      plannedEnd: toDateInput(item.plannedEnd),
    });
  }

  async function saveEdit(item: WorkItem) {
    setEditSaving(true);
    const body: Record<string, unknown> = {
      code: editForm.code,
      name: editForm.name,
      weight: editForm.weight ? Number(editForm.weight) / 100 : 0,
    };
    if (item.parentId !== null) {
      body.plannedStart = editForm.plannedStart || null;
      body.plannedEnd = editForm.plannedEnd || null;
    }
    const res = await fetch(`/api/work-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditSaving(false);
    if (!res.ok) return;
    setEditingId(null);
    onChanged();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body: Record<string, unknown> = {
      code: form.code,
      name: form.name,
      weight: form.weight ? Number(form.weight) / 100 : 0,
    };
    if (form.parentId) body.parentId = Number(form.parentId);
    if (form.plannedStart) body.plannedStart = form.plannedStart;
    if (form.plannedEnd) body.plannedEnd = form.plannedEnd;

    const res = await fetch(`/api/projects/${projectId}/work-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) { setError("추가에 실패했습니다."); return; }
    setForm(emptyForm);
    onChanged();
  }

  async function handleDelete(id: number, isCategory: boolean) {
    const msg = isCategory ? "대분류와 하위 공종을 모두 삭제합니다. 계속할까요?" : "이 공종을 삭제합니다.";
    if (!confirm(msg)) return;
    await fetch(`/api/work-items/${id}`, { method: "DELETE" });
    onChanged();
  }

  const inputCls = "w-full border border-blue-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
  const numInputCls = inputCls + " text-right";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 대분류 합계 경고 */}
      {catWeightWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-base text-yellow-700">
          대분류 비율 합계가 <strong>{(catWeightSum * 100).toFixed(1)}%</strong>입니다. 전체 합계는 100%가 되어야 합니다.
        </div>
      )}

      {/* 추가 폼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-7">
        <h3 className="text-base font-semibold text-gray-700 mb-5">공종 추가</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3">
              <label className="block text-sm text-gray-500 mb-1.5">구분</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">대분류 (새 카테고리)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>↳ {c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm text-gray-500 mb-1.5">코드</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
                placeholder={isSubTask ? "010101" : "01"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-4">
              <label className="block text-sm text-gray-500 mb-1.5">공종명</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder={isSubTask ? "안전관리비" : "가설공사"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-500 mb-1.5">
                {isSubTask ? "카테고리 내 비율 (%)" : "전체 비율 (%)"}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  placeholder="예: 20"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400 flex-shrink-0">%</span>
              </div>
            </div>
            <div className="col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? "추가 중..." : "+ 추가"}
              </button>
            </div>
          </div>

          {isSubTask && (
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-sm text-gray-500 mb-1.5">예정 시작일</label>
                <input
                  type="date"
                  value={form.plannedStart}
                  onChange={(e) => setForm((f) => ({ ...f, plannedStart: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-500 mb-1.5">예정 종료일</label>
                <input
                  type="date"
                  value={form.plannedEnd}
                  onChange={(e) => setForm((f) => ({ ...f, plannedEnd: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500 w-28">코드</th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500">공종명</th>
              <th className="text-right px-5 py-4 text-sm font-semibold text-gray-500 w-40">비율</th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500 w-32">시작일</th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500 w-32">종료일</th>
              <th className="px-5 py-4 w-32" />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const children = workItems
                .filter((w) => w.parentId === cat.id)
                .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
              const childSum = childSumMap.get(cat.id);
              const childSumWarning = childSum !== undefined && Math.abs(childSum - 1) > 0.01;

              return (
                <tr key={cat.id}>
                  <td colSpan={6} className="p-0">
                    <table className="w-full">
                      <tbody>
                        {/* 대분류 행 */}
                        {editingId === cat.id ? (
                          <tr className="border-b border-blue-100 bg-blue-50">
                            <td className="px-5 py-3 w-28">
                              <input value={editForm.code} onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))} className={inputCls} />
                            </td>
                            <td className="px-5 py-3">
                              <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
                            </td>
                            <td className="px-5 py-3 w-40">
                              <div className="flex items-center gap-1.5">
                                <input type="number" step="0.1" min={0} max={100} value={editForm.weight} onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))} className={numInputCls} />
                                <span className="text-sm text-gray-400 flex-shrink-0">%</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 w-32" />
                            <td className="px-5 py-3 w-32" />
                            <td className="px-5 py-3 w-32">
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => saveEdit(cat)} disabled={editSaving} className="text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-3 py-1.5 rounded-lg">저장</button>
                                <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">취소</button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td className="px-5 py-3.5 w-28 text-sm font-semibold text-gray-600">{cat.code}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                                {childSumWarning && (
                                  <span className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                                    소계 {((childSum!) * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 w-40 text-right">
                              <span className="text-sm font-bold text-blue-600">{(cat.weight * 100).toFixed(1)}%</span>
                              <span className="text-xs text-gray-400 ml-1">전체</span>
                            </td>
                            <td className="px-5 py-3.5 w-32" />
                            <td className="px-5 py-3.5 w-32" />
                            <td className="px-5 py-3.5 w-32">
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => startEdit(cat)} className="text-sm text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">수정</button>
                                <button onClick={() => handleDelete(cat.id, true)} className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">삭제</button>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* 소분류 행 */}
                        {children.map((child) => {
                          const actualPct = cat.weight * child.weight * 100;
                          return editingId === child.id ? (
                            <tr key={child.id} className="border-b border-blue-100 bg-blue-50">
                              <td className="pl-10 pr-5 py-3 w-28">
                                <input value={editForm.code} onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))} className={inputCls} />
                              </td>
                              <td className="px-5 py-3">
                                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
                              </td>
                              <td className="px-5 py-3 w-40">
                                <div className="flex items-center gap-1.5">
                                  <input type="number" step="0.1" min={0} max={100} value={editForm.weight} onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))} className={numInputCls} />
                                  <span className="text-sm text-gray-400 flex-shrink-0">%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 w-32">
                                <input type="date" value={editForm.plannedStart} onChange={(e) => setEditForm((f) => ({ ...f, plannedStart: e.target.value }))} className={inputCls} />
                              </td>
                              <td className="px-5 py-3 w-32">
                                <input type="date" value={editForm.plannedEnd} onChange={(e) => setEditForm((f) => ({ ...f, plannedEnd: e.target.value }))} className={inputCls} />
                              </td>
                              <td className="px-5 py-3 w-32">
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => saveEdit(child)} disabled={editSaving} className="text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-3 py-1.5 rounded-lg">저장</button>
                                  <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">취소</button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={child.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="pl-10 pr-5 py-3.5 w-28 text-sm text-gray-400">{child.code}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-700">{child.name}</td>
                              <td className="px-5 py-3.5 w-40 text-right">
                                <div className="text-sm text-gray-700 font-medium">{(child.weight * 100).toFixed(1)}%</div>
                                <div className="text-xs text-gray-400">→ 전체 {actualPct.toFixed(1)}%</div>
                              </td>
                              <td className="px-5 py-3.5 w-32 text-sm text-gray-500">
                                {child.plannedStart ? new Date(child.plannedStart).toLocaleDateString("ko-KR") : "-"}
                              </td>
                              <td className="px-5 py-3.5 w-32 text-sm text-gray-500">
                                {child.plannedEnd ? new Date(child.plannedEnd).toLocaleDateString("ko-KR") : "-"}
                              </td>
                              <td className="px-5 py-3.5 w-32">
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => startEdit(child)} className="text-sm text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">수정</button>
                                  <button onClick={() => handleDelete(child.id, false)} className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">삭제</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-base">
                  공종이 없습니다. 위 폼에서 추가해주세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
