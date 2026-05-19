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
  weight: string;
  plannedStart: string;
  plannedEnd: string;
}

interface EditState {
  code: string;
  name: string;
  weight: string;
  plannedStart: string;
  plannedEnd: string;
}

const emptyForm: FormState = {
  parentId: "",
  code: "",
  name: "",
  weight: "",
  plannedStart: "",
  plannedEnd: "",
};

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

  const leafWeight = workItems.filter((w) => w.parentId !== null).reduce((s, w) => s + w.weight, 0);
  const weightWarning = leafWeight > 0 && Math.abs(leafWeight - 1) > 0.05;

  function startEdit(item: WorkItem) {
    setEditingId(item.id);
    setEditForm({
      code: item.code,
      name: item.name,
      weight: item.parentId !== null ? String(item.weight) : "",
      plannedStart: toDateInput(item.plannedStart),
      plannedEnd: toDateInput(item.plannedEnd),
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(item: WorkItem) {
    setEditSaving(true);
    const body: Record<string, unknown> = {
      code: editForm.code,
      name: editForm.name,
    };
    if (item.parentId !== null) {
      body.weight = editForm.weight ? Number(editForm.weight) : 0;
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
      weight: form.weight ? Number(form.weight) : 0,
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

  async function moveItem(id: number, direction: "up" | "down", siblings: WorkItem[]) {
    const idx = siblings.findIndex((w) => w.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const a = siblings[idx];
    const b = siblings[swapIdx];
    await Promise.all([
      fetch(`/api/work-items/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
      fetch(`/api/work-items/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
    ]);
    onChanged();
  }

  const inputCls = "w-full border border-blue-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {weightWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
          세부공종 가중치 합계가 {(leafWeight * 100).toFixed(1)}%입니다. 합계는 100%가 되어야 합니다.
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">공종 추가</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">구분</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">대분류 (새 카테고리)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>↳ {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">코드</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
                placeholder={isSubTask ? "010101" : "01"}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">공종명</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder={isSubTask ? "안전관리비" : "가설공사"}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isSubTask && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">비율 (0~1)</label>
                <input
                  type="number"
                  step="0.001"
                  min={0}
                  max={1}
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  placeholder="0.05"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          {isSubTask && (
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">예정 시작일</label>
                <input
                  type="date"
                  value={form.plannedStart}
                  onChange={(e) => setForm((f) => ({ ...f, plannedStart: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">예정 종료일</label>
                <input
                  type="date"
                  value={form.plannedEnd}
                  onChange={(e) => setForm((f) => ({ ...f, plannedEnd: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? "추가 중..." : "추가"}
          </button>
        </form>
      </div>

      {/* Item list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">코드</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">공종명</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 w-28">비율</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32">시작일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32">종료일</th>
              <th className="px-4 py-3 w-32" />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const children = workItems
                .filter((w) => w.parentId === cat.id)
                .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
              return (
                <>
                  {/* Category row */}
                  {editingId === cat.id ? (
                    <tr key={cat.id} className="border-b border-blue-100 bg-blue-50">
                      <td className="px-4 py-2">
                        <input value={editForm.code} onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))} className={inputCls} />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
                      </td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => saveEdit(cat)} disabled={editSaving} className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-2 py-1 rounded">저장</button>
                          <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200">취소</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={cat.id} className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-2 text-xs font-semibold text-gray-600">{cat.code}</td>
                      <td className="px-4 py-2 text-xs font-semibold text-gray-700">{cat.name}</td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2">
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={() => startEdit(cat)} className="text-xs text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1 rounded">수정</button>
                          <button onClick={() => handleDelete(cat.id, true)} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded">삭제</button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Child rows */}
                  {children.map((child) =>
                    editingId === child.id ? (
                      <tr key={child.id} className="border-b border-blue-100 bg-blue-50">
                        <td className="px-4 py-2 pl-8">
                          <input value={editForm.code} onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))} className={inputCls} />
                        </td>
                        <td className="px-4 py-2 pl-8">
                          <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" step="0.001" min={0} max={1} value={editForm.weight} onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))} className={inputCls + " text-right"} />
                        </td>
                        <td className="px-4 py-2">
                          <input type="date" value={editForm.plannedStart} onChange={(e) => setEditForm((f) => ({ ...f, plannedStart: e.target.value }))} className={inputCls} />
                        </td>
                        <td className="px-4 py-2">
                          <input type="date" value={editForm.plannedEnd} onChange={(e) => setEditForm((f) => ({ ...f, plannedEnd: e.target.value }))} className={inputCls} />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => saveEdit(child)} disabled={editSaving} className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-2 py-1 rounded">저장</button>
                            <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200">취소</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={child.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-400 pl-8">{child.code}</td>
                        <td className="px-4 py-2 text-xs text-gray-600 pl-8">{child.name}</td>
                        <td className="px-4 py-2 text-xs text-gray-500 text-right">{(child.weight * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-xs text-gray-400">
                          {child.plannedStart ? new Date(child.plannedStart).toLocaleDateString("ko-KR") : "-"}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-400">
                          {child.plannedEnd ? new Date(child.plannedEnd).toLocaleDateString("ko-KR") : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={() => startEdit(child)} className="text-xs text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1 rounded">수정</button>
                            <button onClick={() => handleDelete(child.id, false)} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded">삭제</button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
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
