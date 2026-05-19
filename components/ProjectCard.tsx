import { ProjectWithProgress as Project } from "@/types/models";

interface Props {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onClick, onDelete }: Props) {
  const start = new Date(project.startDate).toLocaleDateString("ko-KR");
  const end = new Date(project.endDate).toLocaleDateString("ko-KR");

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{project.name}</h3>
          <p className="text-sm text-gray-500">{project.siteName}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-300 hover:text-red-400 text-lg leading-none ml-2"
          title="삭제"
        >
          ×
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        {start} ~ {end}
      </p>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">전체 진행률</span>
          <span className="text-xs font-medium text-blue-600">{project.overallProgress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${project.overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
