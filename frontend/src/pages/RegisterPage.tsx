import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerApi } from '../api/auth';
import { useAppStore } from '../store/useAppStore';
import { registerSchema, type RegisterFormValues } from '../schemas';
import type { ApiError } from '../types/api';
import { AuthLayout } from '../components/auth/auth-layout';
import { SubmitButton } from '../components/ui/submit-button';
import { InputField } from '../components/ui/input-field';

function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    control,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = useWatch({ control, name: 'password' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { email, username, password } = values;

      const data = await registerApi({ email, username, password });
      setAuth({ user: data.user, token: data.token });
      toast.success('Регистрация успешна!');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const error = err as ApiError;
      const message =
        error.response?.data?.message || error.message || 'Ошибка регистрации';
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Зарегистрируйтесь для начала использования тайм-менеджмента"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Email"
          type="email"
          placeholder="your@email.com"
          error={errors.email}
          register={register('email')}
          autoComplete="email"
        />

        <InputField
          label="Имя пользователя"
          type="text"
          placeholder="Ваше имя"
          error={errors.username}
          register={register('username')}
          autoComplete="username"
        />

        <InputField
          label="Пароль"
          type="password"
          placeholder="Не менее 6 символов"
          error={errors.password}
          register={register('password')}
          autoComplete="new-password"
        />

        <div className="flex flex-col">
          <InputField
            label="Подтвердите пароль"
            type="password"
            placeholder="Повторите пароль"
            error={errors.confirmPassword}
            register={register('confirmPassword')}
            autoComplete="new-password"
            successMessage={
              !errors.confirmPassword && confirmPassword && passwordsMatch
                ? '✓ Пароли совпадают'
                : undefined
            }
          />
        </div>

        <div className="pt-2">
          <SubmitButton
            className="w-full text-white bg-orange-400 border-none hover:bg-orange-300"
            isSubmitting={isSubmitting}
            isValid={isValid}
            loadingText="Регистрация..."
          >
            Создать аккаунт
          </SubmitButton>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-medium text-orange-400 hover:text-orange-600 hover:underline transition-colors"
          >
            Войти
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
