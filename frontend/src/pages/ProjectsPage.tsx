import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { getProjectsApi, deleteProjectApi } from '../api/projects';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon } from '../icons/Icons';
import { getTimeLogsApi } from '../api/timelogs';
import { Pagination } from '../components/ui/pagination';
import { ProjectCard } from '../components/ui/project-card';
import { LoadingSpinner } from '../components/ui/spinner';
import { SearchInput } from '../components/ui/search-input';

function ProjectsPage() {
  const navigate = useNavigate();
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);

  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [projects, searchQuery]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const loadProjectStats = useCallback(
    async (projectsList: typeof projects) => {
      if (projectsList.length === 0) return;

      try {
        const logs = await getTimeLogsApi({
          projectIds: projectsList.map((p) => p._id),
          limit: 1000,
        });

        const stats: Record<string, number> = {};
        logs.items.forEach((log) => {
          stats[log.projectId] = (stats[log.projectId] || 0) + log.duration;
        });

        setProjectStats(stats);
      } catch (err) {
        console.error('Failed to load project stats:', err);
      }
    },
    [],
  );

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProjectsApi();
      setProjects(data);
      await loadProjectStats(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      toast.error('Не удалось загрузить проекты');
    } finally {
      setIsLoading(false);
    }
  }, [setProjects, loadProjectStats]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [filteredProjects.length, currentPage, itemsPerPage]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true);
        await deleteProjectApi(id);

        const updatedProjects = projects.filter((p) => p._id !== id);
        setProjects(updatedProjects);
        await loadProjectStats(updatedProjects);

        setDeleteConfirmId(null);
        toast.success('Проект удален');
      } catch (err: unknown) {
        console.error('Failed to delete project:', err);
        const axiosError = err as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message || 'Не удалось удалить проект';
        toast.error(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    },
    [projects, setProjects, loadProjectStats],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEdit = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}/edit`);
    },
    [navigate],
  );

  const handleCreateNew = useCallback(() => {
    navigate('/projects/new');
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Проекты</h2>
          <p className="text-sm text-gray-600">Управление вашими проектами</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 border-2 border-orange-300 hover:bg-orange-300 hover:border-orange-400 rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Добавить проект
        </button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
        placeholder="Поиск по названию..."
        resultsCount={filteredProjects.length}
      />

      {paginatedProjects.length === 0 ? (
        <div className="rounded-xl border-2 border-orange-300 p-12 text-center">
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Проекты не найдены' : 'Нет проектов'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 border-2 border-orange-300 hover:bg-orange-300 hover:border-orange-400 rounded-lg font-medium transition-colors"
            >
              Создать первый проект
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                stats={projectStats[project._id] || 0}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteConfirmId={deleteConfirmId}
                isDeleting={isDeleting}
                setDeleteConfirmId={setDeleteConfirmId}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <div className="text-center text-sm text-gray-600 mt-4">
            Показано {paginatedProjects.length} из {filteredProjects.length}{' '}
            проектов
            {totalPages > 1 && ` • Страница ${currentPage} из ${totalPages}`}
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectsPage;
