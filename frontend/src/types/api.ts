export type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{ msg: string; param: string }>;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
};

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('response' in err || 'message' in err || 'code' in err)
  );
}

export function getErrorMessage(
  err: unknown,
  fallback = 'Произошла ошибка',
): string {
  if (isApiError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

export type ApiResponse<T = unknown> = {
  data?: T;
  message?: string;
  success: boolean;
};
