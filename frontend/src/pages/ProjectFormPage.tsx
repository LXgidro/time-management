import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  getProjectsApi,
  createProjectApi,
  updateProjectApi,
} from '../api/projects';
import { type ApiError } from '../types/api';
import toast from 'react-hot-toast';
import { projectSchema, type ProjectFormValues } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ColorPicker } from '../components/ui/color-picker';
import { LoadingSpinner } from '../components/ui/spinner';
import { FormLayout } from '../components/ui/form-layout';
import { InputField } from '../components/ui/input-field';
import { SubmitButton } from '../components/ui/submit-button';
import { PROJECT_COLORS } from '../components/constants/color';

function ProjectFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const setProjects = useAppStore((s) => s.setProjects);
  const [isLoading, setIsLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: PROJECT_COLORS[0],
    },
  });

  const selectedColor = watch('color') || PROJECT_COLORS[0];

  const loadProject = useCallback(async () => {
    try {
      const projects = await getProjectsApi();
      const project = projects.find((p) => p._id === id);

      if (project) {
        setValue('name', project.name);
        setValue('description', project.description || '');
        setValue('color', project.color || PROJECT_COLORS[0]);
      } else {
        toast.error('Проект не найден');
        navigate('/projects');
      }
    } catch {
      toast.error('Не удалось загрузить проект');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  }, [id, setValue, navigate]);

  useEffect(() => {
    if (isEdit && id) {
      loadProject();
    }
  }, [isEdit, id, loadProject]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      let project;

      if (isEdit) {
        project = await updateProjectApi(id!, {
          name: data.name,
          description: data.description || undefined,
          color: data.color,
        });
        toast.success('Проект обновлен');
      } else {
        project = await createProjectApi({
          name: data.name,
          description: data.description || undefined,
          color: data.color,
        });
        toast.success('Проект создан');
      }

      const projects = await getProjectsApi();
      setProjects(projects);

      const fromDashboardSelect = location.state?.fromDashboardSelect;
      const returnTo = location.state?.returnTo;

      if (fromDashboardSelect) {
        navigate(returnTo || '/', {
          replace: true,
          state: {
            selectedProjectId: project._id,
            fromProjectCreation: true,
          },
        });
      } else {
        navigate('/projects', {
          state: {
            message: isEdit ? 'Проект обновлен' : 'Проект создан',
            highlightProjectId: project._id,
          },
        });
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || 'Произошла ошибка');
    }
  };

  const handleCancel = () => {
    if (location.state?.fromDashboardSelect) {
      navigate(location.state?.returnTo || '/');
    } else {
      navigate('/projects');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  return (
    <FormLayout
      title={isEdit ? 'Редактировать проект' : 'Новый проект'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField
          label="Название проекта"
          placeholder="Мой проект"
          error={errors.name}
          register={register('name')}
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Описание (необязательно)
          </label>
          <textarea
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-2 focus:border-orange-400"
            rows={3}
            placeholder="Описание проекта..."
            disabled={isSubmitting}
            {...register('description')}
          />
        </div>

        <ColorPicker
          selectedColor={selectedColor}
          onChange={(color) => setValue('color', color, { shouldDirty: true })}
          disabled={isSubmitting}
        />

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg text-gray-900 hover:bg-orange-300 hover:border-orange-400 transition-colors"
            disabled={isSubmitting}
          >
            Отмена
          </button>

          <SubmitButton
            isSubmitting={isSubmitting}
            isValid={true}
            loadingText={isEdit ? 'Сохранение...' : 'Создание...'}
            className="flex-1"
          >
            {isEdit ? 'Сохранить' : 'Создать проект'}
          </SubmitButton>
        </div>
      </form>
    </FormLayout>
  );
}

export default ProjectFormPage;
