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
      className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {project.name}
          </h3>
          <p className="text-base text-gray-500 mt-0.5">{project.siteName}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-xl leading-none flex-shrink-0"
          title="삭제"
        >
          ×
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-5">
        {start} ~ {end}
      </p>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">전체 진행률</span>
          <span className="text-sm font-bold text-blue-600">{project.overallProgress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${project.overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
