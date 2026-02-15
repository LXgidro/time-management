import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .email('Введите корректный email');

export const passwordSchema = z
  .string()
  .min(1, 'Пароль обязателен')
  .min(6, 'Минимум 6 символов')
  .max(32, 'Слишком длинный пароль');

export const usernameSchema = z
  .string()
  .min(2, 'Минимум 2 символа')
  .max(50, 'Максимум 50 символов')
  .regex(/^[a-zA-Zа-яА-ЯёЁ0-9_\s]+$/, {
    message: 'Может содержать только буквы, цифры и пробелы',
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Новый пароль должен отличаться от текущего',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Название обязательно')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Введите корректный HEX цвет',
    })
    .optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const timerSchema = z.object({
  projectId: z.string().min(1, 'Выберите проект'),
  description: z
    .string()
    .min(1, 'Описание обязательно')
    .max(200, 'Описание не должно превышать 200 символов'),
});

export type TimerFormValues = z.infer<typeof timerSchema>;
