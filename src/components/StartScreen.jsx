import React from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore from '../store/gameStore';
import { useStars } from '../hooks/useVKStorage';

/**
 * Экран приветствия / старта игры
 */
export function StartScreen({ onPlay, onViewMode }) {
  const { savedStats } = useGameStore();
  const { stars } = useStars();

  /**
   * Удаление всего прогресса пользователя
   */
  const handleDeleteProgress = async () => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить весь прогресс? Это действие нельзя отменить.');
    if (!confirmed) {
      return;
    }

    try {
      // Удаляем ключи, устанавливая пустые значения
      await Promise.all([
        vkBridge.send('VKWebAppStorageSet', {
          key: 'mapit_game_stats',
          value: '',
        }),
        vkBridge.send('VKWebAppStorageSet', {
          key: 'mapit_stars',
          value: '',
        }),
        vkBridge.send('VKWebAppStorageSet', {
          key: 'mapit_settings',
          value: '',
        }),
      ]);
      // Перезагружаем страницу для применения изменений
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при удалении прогресса:', err);
      alert('Не удалось удалить прогресс. Попробуйте позже.');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 z-20">
      {/* Звёзды в правом верхнем углу */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-400/30 shadow-lg">
          <svg
            className="w-6 h-6 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-yellow-400 font-bold text-lg">{stars}</span>
        </div>
      </div>

      <div className="text-center px-4 sm:px-6 md:px-8 max-w-[500px] w-full">
        {/* Логотип / Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            Найди страну
          </h1>
          <p className="text-blue-200 text-sm sm:text-base md:text-lg">
            Покажи всем на что ты способен!
          </p>
        </div>

        {/* Иконка глобуса */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-blue-400/30 shadow-2xl">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Статистика */}
        {savedStats && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-xs mx-auto">
            <p className="text-blue-200 text-xs sm:text-sm mb-2">Ваш лучший результат</p>
            <div className="flex justify-center gap-4 sm:gap-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">{savedStats.bestScore || 0}</p>
                <p className="text-blue-300 text-xs">очков</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">{savedStats.bestAccuracy || 0}%</p>
                <p className="text-blue-300 text-xs">точность</p>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="space-y-3 w-full max-w-xs mx-auto">
          <button
            onClick={onPlay}
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold text-lg sm:text-xl rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-blue-900"
            aria-label="Играть"
          >
            Играть
          </button>

          <button
            onClick={onViewMode}
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold text-lg sm:text-xl rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900"
            aria-label="Режим просмотра"
          >
            Режим просмотра
          </button>

          <button
            onClick={handleDeleteProgress}
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold text-lg sm:text-xl rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-blue-900"
            aria-label="Удалить прогресс"
          >
            Удалить прогресс
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
