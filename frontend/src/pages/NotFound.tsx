import { Link, useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-orange-200 mb-4">404</div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          Страница не найдена
        </h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Извините, мы не смогли найти страницу, которую вы ищете. Возможно, вы
          ошиблись в адресе или страница была перемещена.
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-orange-300 text-white font-medium rounded-lg hover:bg-orange-400 transition-colors"
          >
            На главную
          </Link>

          <div className="text-sm text-gray-500">
            <button
              onClick={handleGoBack}
              className="hover:text-gray-700 underline"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
