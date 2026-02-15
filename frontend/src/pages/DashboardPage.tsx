import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { getTimeLogsApi } from '../api/timelogs';
import {
  pauseTimerApi,
  resumeTimerApi,
  startTimerApi,
  stopTimerApi,
  getActiveTimerApi,
} from '../api/timer';
import { getProjectsApi } from '../api/projects';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { formatDurationReadable } from '../utils/formatDuration';
import type { TimeLogDto } from '../types/timelog';
import { RecentLogsList } from '../components/dashboard/recent-logs';
import { StatsCard } from '../components/dashboard/stats-card';
import { TimerDisplay } from '../components/timer/timer-display';
import { LoadingSpinner } from '../components/ui/spinner';

function DashboardPage() {
  const intervalRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const navigate = useNavigate();

  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const activeTimer = useAppStore((s) => s.activeTimer);
  const setActiveTimer = useAppStore((s) => s.setActiveTimer);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [recentLogs, setRecentLogs] = useState<TimeLogDto[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0 });

  const [isPaused, setIsPaused] = useState(() => {
    return localStorage.getItem('timer_paused') === 'true';
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const savedElapsed = localStorage.getItem('timer_elapsed_seconds');
    const wasPaused = localStorage.getItem('timer_paused') === 'true';

    if (wasPaused && savedElapsed) {
      return parseInt(savedElapsed, 10);
    }
    return 0;
  });

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjectsApi();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err: unknown) {
      console.error('loadProjects:', err);
      toast.error('Не удалось загрузить проекты');
    }
  }, [setProjects, selectedProjectId]);

  const loadRecentLogs = useCallback(async () => {
    try {
      const data = await getTimeLogsApi({ limit: 5 });
      setRecentLogs(data.items);
    } catch (err: unknown) {
      console.error('loadRecentLogs:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const today = dayjs().startOf('day').toISOString();
      const weekAgo = dayjs().subtract(7, 'day').startOf('day').toISOString();
      const endOfToday = dayjs().endOf('day').toISOString();

      const [todayData, weekData] = await Promise.all([
        getTimeLogsApi({ startDate: today, endDate: endOfToday, limit: 4242 }),
        getTimeLogsApi({
          startDate: weekAgo,
          endDate: endOfToday,
          limit: 4242,
        }),
      ]);

      const todayTotal = todayData.items.reduce(
        (sum, log) => sum + log.duration,
        0,
      );
      const weekTotal = weekData.items.reduce(
        (sum, log) => sum + log.duration,
        0,
      );

      setStats({ today: todayTotal, week: weekTotal });
    } catch (err: unknown) {
      console.error('loadStats:', err);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await loadProjects();

        const timer = await getActiveTimerApi();
        setActiveTimer(timer);

        if (timer) {
          if (timer.status === 'running') {
            localStorage.removeItem('timer_paused');
            localStorage.removeItem('timer_paused_at');
            localStorage.removeItem('timer_elapsed_seconds');
            setIsPaused(false);
            setElapsedSeconds(timer.elapsedSeconds || 0);
          } else if (timer.status === 'paused') {
            setIsPaused(true);
            setElapsedSeconds(timer.elapsedSeconds || 0);
          }
        }

        await Promise.allSettled([loadRecentLogs(), loadStats()]);
      } catch (err) {
        console.error('loadInitialData:', err);
      } finally {
        setIsLoading(false);
        setHasInitialLoad(true);
      }
    };

    if (!hasInitialLoad) {
      loadInitialData();
    }
  }, [hasInitialLoad, loadProjects, loadRecentLogs, loadStats, setActiveTimer]);

  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running' || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setElapsedSeconds(activeTimer.elapsedSeconds || 0);

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTimer, isPaused]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isPaused || activeTimer?.status === 'paused') {
        localStorage.setItem('timer_paused', 'true');
        localStorage.setItem('timer_paused_at', new Date().toISOString());
        localStorage.setItem(
          'timer_elapsed_seconds',
          elapsedSeconds.toString(),
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPaused, activeTimer, elapsedSeconds]);

  const handleStart = async () => {
    if (!selectedProjectId) {
      toast.error('Выберите проект');
      return;
    }
    if (!description.trim()) {
      toast.error('Введите описание задачи');
      return;
    }

    try {
      const timer = await startTimerApi({
        projectId: selectedProjectId,
        description: description.trim(),
      });

      localStorage.removeItem('timer_paused');
      localStorage.removeItem('timer_paused_at');
      localStorage.removeItem('timer_elapsed_seconds');

      setActiveTimer(timer);
      setIsPaused(false);
      setDescription('');
      setElapsedSeconds(timer.elapsedSeconds || 0);
      toast.success('Таймер запущен');
    } catch {
      toast.error('Не удалось запустить таймер');
    }
  };

  const refreshDashboard = useCallback(async () => {
    try {
      const logsData = await getTimeLogsApi({ limit: 5 });
      setRecentLogs(logsData.items);

      const today = dayjs().startOf('day').toISOString();
      const weekAgo = dayjs().subtract(7, 'day').startOf('day').toISOString();
      const endOfToday = dayjs().endOf('day').toISOString();

      const [todayData, weekData] = await Promise.all([
        getTimeLogsApi({ startDate: today, endDate: endOfToday, limit: 4242 }),
        getTimeLogsApi({
          startDate: weekAgo,
          endDate: endOfToday,
          limit: 4242,
        }),
      ]);

      const todayTotal = todayData.items.reduce(
        (sum, log) => sum + log.duration,
        0,
      );
      const weekTotal = weekData.items.reduce(
        (sum, log) => sum + log.duration,
        0,
      );

      setStats({ today: todayTotal, week: weekTotal });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  }, []);

  const handleStop = async () => {
    if (!activeTimer) return;

    try {
      await stopTimerApi(activeTimer._id);

      setActiveTimer(null);
      setElapsedSeconds(0);
      setIsPaused(false);
      setRefreshKey((prev) => prev + 1);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      toast.success('Таймер остановлен');

      await refreshDashboard();
      await loadProjects();
    } catch {
      toast.error('Не удалось остановить таймер');
    }
  };
  const handlePause = async () => {
    if (!activeTimer) return;

    try {
      await pauseTimerApi(activeTimer._id);

      localStorage.setItem('timer_paused', 'true');
      localStorage.setItem('timer_paused_at', new Date().toISOString());
      localStorage.setItem('timer_elapsed_seconds', elapsedSeconds.toString());

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsPaused(true);

      const updatedTimer = await getActiveTimerApi();
      if (updatedTimer) {
        setActiveTimer(updatedTimer);
      } else {
        setActiveTimer(null);
      }

      toast.success('Таймер на паузе');
    } catch {
      toast.error('Не удалось поставить на паузу');
    }
  };

  const handleResume = async () => {
    if (!activeTimer) return;

    try {
      await resumeTimerApi(activeTimer._id);

      localStorage.removeItem('timer_paused');
      localStorage.removeItem('timer_paused_at');
      localStorage.removeItem('timer_elapsed_seconds');

      setIsPaused(false);

      const updatedTimer = await getActiveTimerApi();
      if (updatedTimer) {
        setActiveTimer(updatedTimer);
        setElapsedSeconds(updatedTimer.elapsedSeconds || 0);
      } else {
        setActiveTimer(null);
        setElapsedSeconds(0);
      }

      toast.success('Таймер возобновлен');
    } catch {
      toast.error('Не удалось возобновить');
    }
  };

  const getProjectName = useCallback(
    (projectId: string) => {
      return (
        projects.find((p) => p._id === projectId)?.name || 'Неизвестный проект'
      );
    },
    [projects],
  );

  const handleCreateNewProject = useCallback(() => {
    navigate('/projects/new', {
      state: { fromDashboardSelect: true, returnTo: '/' },
    });
  }, [navigate]);

  if (isLoading && !hasInitialLoad) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  return (
    <div className="space-y-8">
      <TimerDisplay
        activeTimer={activeTimer}
        elapsedSeconds={elapsedSeconds}
        isPaused={isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        description={description}
        onDescriptionChange={setDescription}
        projects={projects}
        onCreateNewProject={handleCreateNewProject}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <StatsCard
          label="Сегодня"
          value={formatDurationReadable(stats.today)}
        />
        <StatsCard
          label="За неделю"
          value={formatDurationReadable(stats.week)}
        />
      </div>

      {recentLogs.length > 0 && (
        <RecentLogsList
          key={`recent-logs-${refreshKey}`}
          logs={recentLogs}
          getProjectName={getProjectName}
          onViewAll={() => navigate('/analytics')}
        />
      )}
    </div>
  );
}

export default DashboardPage;
