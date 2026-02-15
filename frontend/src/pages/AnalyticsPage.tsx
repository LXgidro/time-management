import { useEffect, useState, useCallback, useMemo } from 'react';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';
import { useAppStore } from '../store/useAppStore';
import { getProjectsApi } from '../api/projects';
import { getTimeLogsApi, deleteTimeLogApi } from '../api/timelogs';
import {
  getAnalyticsSummaryApi,
  type AnalyticsSummary,
} from '../api/analytics';
import { formatDurationForCharts } from '../utils/formatDuration';

import toast from 'react-hot-toast';
import type { TimeLogDto } from '../types/timelog';
import { LoadingSpinner } from '../components/ui/spinner';
import { TimeLogTable } from '../components/ui/timelog-table';
import { Pagination } from '../components/ui/pagination';

function AnalyticsPage() {
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  );
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [logs, setLogs] = useState<TimeLogDto[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const limit = 20;

  useEffect(() => {
    const loadInitialProjects = async () => {
      try {
        const data = await getProjectsApi();
        setProjects(data);
      } catch (err: unknown) {
        console.error('Failed to load projects:', err);
        toast.error('Не удалось загрузить проекты');
      }
    };

    loadInitialProjects();
  }, [setProjects]);

  const confirmDelete = useCallback(
    async (logId: string) => {
      setIsDeleting(true);
      try {
        await deleteTimeLogApi(logId);

        setLogs((prev) => prev.filter((log) => log._id !== logId));
        setTotalLogs((prev) => prev - 1);

        const start = dayjs(startDate).startOf('day').toISOString();
        const end = dayjs(endDate).endOf('day').toISOString();

        const analyticsData = await getAnalyticsSummaryApi({
          startDate: start,
          endDate: end,
          projectIds:
            selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
        });
        setSummary(analyticsData);

        toast.success('Запись успешно удалена');
      } catch (err: unknown) {
        console.error('Failed to delete time log:', err);
        toast.error('Не удалось удалить запись');
      } finally {
        setIsDeleting(false);
        setDeleteConfirmId(null);
      }
    },
    [startDate, endDate, selectedProjectIds],
  );

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!hasInitialLoad) return;

      setIsLoading(true);

      try {
        const start = dayjs(startDate).startOf('day').toISOString();
        const end = dayjs(endDate).endOf('day').toISOString();

        const analyticsData = await getAnalyticsSummaryApi({
          startDate: start,
          endDate: end,
          projectIds:
            selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
        });
        setSummary(analyticsData);

        const logsData = await getTimeLogsApi({
          startDate: start,
          endDate: end,
          projectIds:
            selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
          page: currentPage,
          limit,
          sortBy,
          sortOrder,
        });

        setLogs(logsData.items);
        setTotalLogs(logsData.total);
      } catch (err: unknown) {
        console.error('AnalyticsPage loadAnalyticsData :', err);
        toast.error('Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(loadAnalyticsData, 300);

    return () => clearTimeout(timeoutId);
  }, [
    startDate,
    endDate,
    selectedProjectIds,
    currentPage,
    sortBy,
    sortOrder,
    hasInitialLoad,
  ]);

  useEffect(() => {
    if (projects.length > 0 && !hasInitialLoad) {
      setHasInitialLoad(true);
    }
  }, [projects.length, hasInitialLoad]);

  const handleProjectToggle = useCallback((projectId: string) => {
    setSelectedProjectIds((prev) => {
      const newIds = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      return newIds;
    });
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (field: 'date' | 'duration') => {
      setSortBy(field);
      setSortOrder((prev) =>
        field === sortBy ? (prev === 'asc' ? 'desc' : 'asc') : 'desc',
      );
      setCurrentPage(1);
    },
    [sortBy],
  );

  const handleDateChange = useCallback(
    (type: 'start' | 'end', value: string) => {
      if (type === 'start') {
        setStartDate(value);
      } else {
        setEndDate(value);
      }
      setCurrentPage(1);
    },
    [],
  );

  const getProjectName = useCallback(
    (projectId: string) => {
      return (
        projects.find((p) => p._id === projectId)?.name || 'Неизвестный проект'
      );
    },
    [projects],
  );

  const pieData = useMemo(() => {
    if (!summary?.byProject) return [];

    return summary.byProject
      .filter((item) => {
        if (selectedProjectIds.length === 0) return true;
        return selectedProjectIds.includes(item._id);
      })
      .map((item) => ({
        name: getProjectName(item._id),
        value: item.totalDuration,
        color: projects.find((p) => p._id === item._id)?.color || '#3b82f6',
      }));
  }, [summary, selectedProjectIds, projects, getProjectName]);

  const barData = useMemo(() => {
    if (!summary?.byDay) return [];

    return summary.byDay.map((item) => ({
      date: dayjs(item._id).format('DD.MM'),
      duration: item.totalDuration,
    }));
  }, [summary]);

  const totalPages = Math.ceil(totalLogs / limit);

  if (isLoading && !hasInitialLoad) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Аналитика
          </h2>
          <p className="text-sm text-gray-600">Анализ потраченного времени</p>
        </div>
      </div>

      <div className="rounded-xl border-2 border-orange-300 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Начало периода
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:outline-none focus:border-2 focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Конец периода
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:outline-none focus:border-2 focus:border-orange-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">
            Проекты:
          </label>
          <div className="flex flex-wrap gap-2">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => handleProjectToggle(project._id)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedProjectIds.includes(project._id)
                    ? 'bg-orange-300 border-2 border-orange-300 hover:border-orange-400 text-gray-900'
                    : 'border-2 border-orange-300 text-gray-900 hover:bg-orange-300 hover:border-orange-400'
                }`}
              >
                {project.color && (
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: project.color }}
                  />
                )}
                {project.name}
              </button>
            ))}

            {selectedProjectIds.length > 0 && (
              <button
                onClick={() => setSelectedProjectIds([])}
                className="px-3 py-1 rounded-lg text-sm font-medium border-2 border-orange-300 text-gray-900 hover:bg-orange-300 hover:border-orange-400"
              >
                Сбросить все
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border-2 border-orange-300 p-12 text-center">
          <LoadingSpinner fullScreen={false} size="md" />
          <p className="text-gray-600 mt-4">Загрузка данных...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border-2 border-orange-300 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Распределение по проектам
            </h3>
            {pieData.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                {summary
                  ? 'Нет данных за выбранный период'
                  : 'Загрузите данные'}
              </p>
            ) : (
              <Chart
                type="pie"
                height={300}
                series={pieData.map((d) => d.value)}
                options={{
                  labels: pieData.map((d) => d.name),
                  chart: { foreColor: '#CBD5F5' },
                  legend: {
                    position: 'bottom',
                    labels: { colors: '#000000' },
                  },
                  tooltip: {
                    y: {
                      formatter: (val: number) => formatDurationForCharts(val),
                    },
                  },
                  colors: pieData.map((d) => d.color),
                }}
              />
            )}
          </div>

          <div className="rounded-xl border-2 border-orange-300 p-6">
            <h3 className="text-lg font-semibold mb-4">Динамика по дням</h3>
            {barData.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                {summary
                  ? 'Нет данных за выбранный период'
                  : 'Загрузите данные'}
              </p>
            ) : (
              <Chart
                type="bar"
                height={300}
                series={[
                  { name: 'Время', data: barData.map((d) => d.duration) },
                ]}
                options={{
                  chart: { toolbar: { show: false }, foreColor: '#cbd5f5' },
                  xaxis: {
                    categories: barData.map((d) => d.date),
                    labels: { style: { colors: '#000000' } },
                  },
                  yaxis: {
                    labels: {
                      style: { colors: '#000000' },
                      formatter: (val: number) => formatDurationForCharts(val),
                    },
                  },
                  tooltip: {
                    y: {
                      formatter: (val: number) => formatDurationForCharts(val),
                    },
                  },
                  colors: ['#ff8725'],
                }}
              />
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border-2 border-orange-300 p-6">
        <h3 className="text-lg font-semibold mb-4">Детальные записи</h3>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner fullScreen={false} size="sm" />
            <p className="text-sm text-gray-600 mt-2">Загрузка записей...</p>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">
            {summary
              ? 'Нет записей за выбранный период'
              : 'Примените фильтры для загрузки записей'}
          </p>
        ) : (
          <>
            <TimeLogTable
              logs={logs}
              projects={projects}
              getProjectName={getProjectName}
              onDelete={confirmDelete}
              deleteConfirmId={deleteConfirmId}
              isDeleting={isDeleting}
              setDeleteConfirmId={setDeleteConfirmId}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}

            <p className="text-sm text-gray-600 mt-4">
              Показано {logs.length} из {totalLogs} записей
              {totalPages > 1 && ` • Страница ${currentPage} из ${totalPages}`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
