import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginApi } from '../api/auth';
import { useAppStore } from '../store/useAppStore';
import { loginSchema, type LoginFormValues } from '../schemas';
import { type ApiError } from '../types/api';
import { InputField } from '../components/ui/input-field';
import { SubmitButton } from '../components/ui/submit-button';
import { AuthLayout } from '../components/auth/auth-layout';

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await loginApi(values);
      setAuth({ user: data.user, token: data.token });
      toast.success('Успешный вход');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const error = err as ApiError;
      const message =
        error.response?.data?.message || error.message || 'Ошибка входа';
      toast.error(message);
    }
  };

  return (
    <AuthLayout title="Вход в аккаунт" subtitle="Добро пожаловать обратно!">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <InputField
          label="Email"
          type="email"
          placeholder="your@email.com"
          error={errors.email}
          register={register('email')}
          autoComplete="email"
        />

        <InputField
          label="Пароль"
          type="password"
          placeholder="Ваш пароль"
          error={errors.password}
          register={register('password')}
          autoComplete="current-password"
        />

        <SubmitButton
          isSubmitting={isSubmitting}
          isValid={isValid}
          loadingText="Вход..."
        >
          Войти
        </SubmitButton>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="font-medium text-orange-500 hover:text-orange-600 hover:underline transition-colors"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
