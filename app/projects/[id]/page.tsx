"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import GanttChart from "@/components/GanttChart";
import WorkItemPanel from "@/components/WorkItemPanel";
import InsuranceCalc from "@/components/InsuranceCalc";
import { Project, WorkItem } from "@/types/models";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [tab, setTab] = useState<"gantt" | "items" | "insurance">("gantt");
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
    try {
      const { toPng } = await import("html-to-image");
      const { default: jsPDF } = await import("jspdf");
      const el = document.getElementById("gantt-export");
      if (!el || !project) return;
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = dataUrl;
      });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / img.naturalWidth, pageHeight / img.naturalHeight);
      pdf.addImage(dataUrl, "PNG", 0, 0, img.naturalWidth * ratio, img.naturalHeight * ratio);
      const today = new Date().toISOString().slice(0, 10);
      pdf.save(`${project.name}_${project.siteName}_공정표_${today}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  if (!project) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 text-lg">불러오는 중...</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-base text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← 목록
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{project.siteName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/projects/${id}/edit`)}
            className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600"
          >
            프로젝트 수정
          </button>
          <button
            onClick={copyShareLink}
            className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600"
          >
            {copied ? "✓ 복사됨" : "공유 링크 복사"}
          </button>
          <button
            onClick={regenerateToken}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-2"
          >
            링크 재발급
          </button>
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="text-sm bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {exporting ? "생성 중..." : "PDF 내보내기"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-2"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="px-10 py-8">
        <div className="flex gap-1 mb-7 bg-gray-100 rounded-xl p-1.5 w-fit">
          {([["gantt", "간트 차트"], ["items", "공종 관리"], ["insurance", "보할 계산"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-2 text-base font-medium rounded-lg transition-colors ${
                tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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

        {tab === "insurance" && (
          <InsuranceCalc />
        )}
      </main>
    </div>
  );
}
