"use client";

import { useEffect, useState, use } from "react";
import GanttChart from "@/components/GanttChart";
import { ProjectWithWorkItems as Project } from "@/types/models";

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((res) => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => data && setProject(data));
  }, [token]);

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
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pw / canvas.width, ph / canvas.height);
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * ratio, canvas.height * ratio);
    const today = new Date().toISOString().slice(0, 10);
    pdf.save(`${project.name}_${project.siteName}_공정표_${today}.pdf`);
    setExporting(false);
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">링크가 유효하지 않습니다</h1>
          <p className="text-gray-400 text-sm">이 공유 링크는 만료되었거나 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{project.name}</h1>
          <p className="text-xs text-gray-500">{project.siteName} — 공사예정공정표 (조회 전용)</p>
        </div>
        <button
          onClick={exportPDF}
          disabled={exporting}
          className="text-sm bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {exporting ? "생성 중..." : "PDF 내보내기"}
        </button>
      </header>

      <main className="px-8 py-6">
        <div id="gantt-export">
          <GanttChart
            project={project}
            workItems={project.workItems}
            readonly={true}
          />
        </div>
      </main>
    </div>
  );
}
