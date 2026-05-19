"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import GanttChart from "@/components/GanttChart";
import WorkItemPanel from "@/components/WorkItemPanel";
import { Project, WorkItem } from "@/types/models";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [tab, setTab] = useState<"gantt" | "items">("gantt");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [projRes, itemsRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/projects/${id}/work-items`),
    ]);
    if (!projRes.ok) { router.push("/dashboard"); return; }
    setProject(await projRes.json());
    if (itemsRes.ok) setWorkItems(await itemsRes.json());
  }

  async function handleProgressUpdate(itemId: number, progress: number) {
    await fetch(`/api/work-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actualProgress: progress }),
    });
    setWorkItems((prev) =>
      prev.map((w) => (w.id === itemId ? { ...w, actualProgress: progress } : w))
    );
  }

  async function copyShareLink() {
    if (!project) return;
    const url = `${window.location.origin}/share/${project.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerateToken() {
    if (!confirm("링크를 재발급하면 기존 공유 링크가 무효화됩니다. 계속할까요?")) return;
    const res = await fetch(`/api/projects/${id}/share-token`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setProject((prev) => prev ? { ...prev, shareToken: data.shareToken } : null);
    }
  }

  async function exportPDF() {
    setExporting(true);
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const el = document.getElementById("gantt-export");
    if (!el || !project) { setExporting(false); return; }

    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * ratio, canvas.height * ratio);

    const today = new Date().toISOString().slice(0, 10);
    pdf.save(`${project.name}_${project.siteName}_공정표_${today}.pdf`);
    setExporting(false);
  }

  if (!project) return <div className="flex items-center justify-center min-h-screen text-gray-400">불러오는 중...</div>;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-gray-600 text-sm">
            ← 목록
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{project.name}</h1>
            <p className="text-xs text-gray-500">{project.siteName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/projects/${id}/edit`)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            프로젝트 수정
          </button>
          <button
            onClick={copyShareLink}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            {copied ? "✓ 복사됨" : "공유 링크 복사"}
          </button>
          <button
            onClick={regenerateToken}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            링크 재발급
          </button>
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="text-sm bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {exporting ? "생성 중..." : "PDF 내보내기"}
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm text-gray-400 hover:text-gray-600">
            로그아웃
          </button>
        </div>
      </header>

      <main className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {([["gantt", "간트 차트"], ["items", "공종 관리"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "gantt" && (
          <div id="gantt-export">
            <GanttChart
              project={project}
              workItems={workItems}
              readonly={false}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        )}

        {tab === "items" && (
          <WorkItemPanel
            projectId={project.id}
            workItems={workItems}
            onChanged={fetchData}
          />
        )}
      </main>
    </div>
  );
}
