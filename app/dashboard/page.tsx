"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import NewProjectModal from "@/components/NewProjectModal";
import { ProjectWithProgress as Project } from "@/types/models";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  }

  async function handleDelete(id: number) {
    if (!confirm("이 프로젝트를 삭제하시겠습니까?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-10 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공정표 관리 시스템</h1>
          <p className="text-base text-gray-500 mt-0.5">{session?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-base text-gray-400 hover:text-gray-700 transition-colors"
        >
          로그아웃
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-800">
            현장 목록
            <span className="ml-2 text-base font-normal text-gray-400">({projects.length}건)</span>
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            + 새 프로젝트
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-xl mb-2">등록된 프로젝트가 없습니다.</p>
            <p className="text-base">새 프로젝트를 추가해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/projects/${project.id}`)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => {
            setProjects((prev) => [p, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
