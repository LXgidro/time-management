import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { meApi, updateProfileApi, updatePasswordApi } from '../api/auth';
import { type ApiError, getErrorMessage } from '../types/api';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormValues,
  type ChangePasswordFormValues,
} from '../schemas';
import { InputField } from '../components/ui/input-field';
import { LoadingSpinner } from '../components/ui/spinner';
import { SettingsLayout } from '../components/settings/settings-layout';
import { Tabs } from '../components/ui/tabs';
import { SubmitButton } from '../components/ui/submit-button';

type Tab = 'profile' | 'security';

const PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  'Current password is incorrect': 'Неверный текущий пароль',
  'New password must be at least 6 characters':
    'Новый пароль должен быть не менее 6 символов',
  'Current and new password are required': 'Введите текущий и новый пароль',
};

function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const setAuth = useAppStore((s) => s.setAuth);
  const token = useAppStore((s) => s.token);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    control: passwordControl,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = useWatch({
    control: passwordControl,
    name: 'newPassword',
  });
  const confirmPassword = useWatch({
    control: passwordControl,
    name: 'confirmPassword',
  });

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await meApi();
        resetProfile({
          email: userData.email || '',
          username: userData.username || '',
        });
      } catch {
        toast.error('Не удалось загрузить данные пользователя');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [resetProfile]);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    if (!token) {
      toast.error('Не авторизован');
      return;
    }
    try {
      const updated = await updateProfileApi({
        email: values.email,
        username: values.username || undefined,
      });

      setAuth({
        user: {
          _id: updated._id,
          email: updated.email,
          username: updated.username || '',
        },
        token,
      });

      toast.success('Профиль обновлен');
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error?.response?.data?.message;

      if (errorMessage === 'Email уже используется') {
        toast.error('Этот email уже используется другим пользователем');
      } else {
        toast.error(getErrorMessage(err, 'Не удалось обновить профиль'));
      }
    }
  };

  const onUpdatePassword = async (values: ChangePasswordFormValues) => {
    try {
      await updatePasswordApi({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success('Пароль изменен');
      resetPassword();
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message;

      if (errorMessage && PASSWORD_ERROR_MESSAGES[errorMessage]) {
        toast.error(PASSWORD_ERROR_MESSAGES[errorMessage]);
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Не удалось изменить пароль');
      }
    }
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'profile', label: 'Профиль' },
    { id: 'security', label: 'Смена пароля' },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  return (
    <SettingsLayout
      title="Настройки"
      description="Управление аккаунтом и настройками"
    >
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' && (
        <div className="rounded-xl border-2 border-orange-300 p-6">
          <h3 className="text-lg font-semibold mb-4">Профиль</h3>
          <form
            onSubmit={handleSubmitProfile(onUpdateProfile)}
            className="space-y-4"
          >
            <InputField
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={profileErrors.email}
              register={registerProfile('email')}
            />

            <InputField
              label="Имя пользователя"
              type="text"
              placeholder="Ваше имя"
              error={profileErrors.username}
              register={registerProfile('username')}
            />

            <div className="pt-2">
              <SubmitButton
                isSubmitting={isProfileSubmitting}
                loadingText="Сохранение..."
              >
                Сохранить изменения
              </SubmitButton>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="rounded-xl border-2 border-orange-300 p-6">
          <h3 className="text-lg font-semibold mb-4">Смена пароля</h3>
          <form
            onSubmit={handleSubmitPassword(onUpdatePassword)}
            className="space-y-4"
          >
            <InputField
              label="Текущий пароль"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.currentPassword}
              register={registerPassword('currentPassword')}
            />

            <InputField
              label="Новый пароль"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.newPassword}
              register={registerPassword('newPassword')}
            />

            <div>
              <InputField
                label="Подтвердите новый пароль"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.confirmPassword}
                register={registerPassword('confirmPassword')}
                successMessage={
                  !passwordErrors.confirmPassword &&
                  confirmPassword &&
                  passwordsMatch
                    ? '✓ Пароли совпадают'
                    : undefined
                }
              />
            </div>

            <div className="pt-2">
              <SubmitButton
                isSubmitting={isPasswordSubmitting}
                loadingText="Изменение..."
              >
                Изменить пароль
              </SubmitButton>
            </div>
          </form>
        </div>
      )}
    </SettingsLayout>
  );
}

export default SettingsPage;
