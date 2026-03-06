import React from 'react';
import { GAME_MODE_CONFIG, GameMode } from '../store/gameStore';

/**
 * Экран выбора режима игры
 */
export function ModeSelectionScreen({ onModeSelect, onBack }) {
  const modes = [
    {
      id: GameMode.QUICK,
      ...GAME_MODE_CONFIG[GameMode.QUICK],
    },
    {
      id: GameMode.STANDARD,
      ...GAME_MODE_CONFIG[GameMode.STANDARD],
    },
    {
      id: GameMode.ENDLESS,
      ...GAME_MODE_CONFIG[GameMode.ENDLESS],
    },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 z-20">
      <div className="text-center px-4 sm:px-6 md:px-8 max-w-lg w-full mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Выберите режим
          </h1>
          <p className="text-blue-200 text-sm sm:text-base">
            Выберите формат игры для начала
          </p>
        </div>

        {/* Карточки режимов */}
        <div className="space-y-3 sm:space-y-4 mb-8">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className={`w-full p-4 sm:p-5 bg-gradient-to-r ${mode.color} hover:opacity-90 
                rounded-2xl shadow-xl border-2 border-white/20
                transform transition-all duration-200 
                hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-900
                flex items-center gap-4 sm:gap-5`}
              aria-label={`Выбрать режим ${mode.name}`}
            >
              {/* Иконка режима */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl sm:text-3xl">
                {mode.icon}
              </div>

              {/* Информация о режиме */}
              <div className="flex-grow text-left">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5">
                  {mode.name}
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm opacity-90">
                  {mode.description}
                </p>
              </div>

              {/* Стрелка */}
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Кнопка "Назад" */}
        <button
          onClick={onBack}
          className="px-6 py-3 sm:px-8 sm:py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm 
            text-white font-medium text-sm sm:text-base rounded-xl 
            border border-white/20 shadow-lg
            transform transition-all duration-200 
            hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-blue-900
            flex items-center gap-2 mx-auto"
          aria-label="Назад"
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
          Назад
        </button>

        {/* Подсказки для режимов */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-blue-200">
          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <span className="font-semibold text-yellow-300">⚡ Быстрый</span>
            <br />
            Для быстрой игры
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <span className="font-semibold text-blue-300">🎯 Обычный</span>
            <br />
            Классическая игра
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <span className="font-semibold text-purple-300">♾️ Бесконечный</span>
            <br />
            Играй до ошибки
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeSelectionScreen;
