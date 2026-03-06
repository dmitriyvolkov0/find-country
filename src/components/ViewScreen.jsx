import React from 'react';

/**
 * Экран режима просмотра
 */
export function ViewScreen({ onExit }) {
  return (
    <div className="absolute top-4 left-4 z-[999]">
      <button
        onClick={onExit}
        className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 flex items-center gap-2"
        aria-label="Выйти из режима просмотра"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="hidden sm:inline">В меню</span>
      </button>

      {/* Подсказка */}
      <div className="mt-3 p-3 bg-blue-900/80 backdrop-blur-sm rounded-lg border border-blue-400/30 max-w-xs">
        <p className="text-blue-100 text-xs sm:text-sm">
          <span className="font-semibold">🌍 Режим просмотра</span>
          <br />
          Вращайте глобус и изучайте страны. Названия стран отображаются на карте.
        </p>
      </div>
    </div>
  );
}

export default ViewScreen;
