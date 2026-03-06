import React from 'react';
import useGameStore from '../store/gameStore';

/**
 * Экран приветствия / старта игры
 */
export function StartScreen({ onPlay, onViewMode }) {
  const { savedStats } = useGameStore();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 z-20">
      <div className="text-center px-4 sm:px-6 md:px-8 max-w-md w-full">
        {/* Логотип / Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            Map It!
          </h1>
          <p className="text-blue-200 text-sm sm:text-base md:text-lg">
            Угадай страну на карте
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
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
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
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
