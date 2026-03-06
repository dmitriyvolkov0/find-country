import React from 'react';
import useGameStore from '../store/gameStore';

/**
 * Компонент bottom sheet для подтверждения/отмены выбора страны
 * Выезжает снизу вверх (как в мобильных приложениях)
 */
export function ConfirmationButtons() {
  const { pendingSelection, confirmSelection, cancelSelection } = useGameStore();

  // Если нет ожидающего выбора, не рендерим
  if (!pendingSelection) {
    return null;
  }

  const countryName = pendingSelection?.properties?.NAME || '';

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        style={{
          animation: 'bottomSheetFadeIn 0.2s ease-out forwards',
        }}
        onClick={cancelSelection}
      />

      {/* Панель выезжает снизу */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50"
        style={{
          animation: 'bottomSheetSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl p-4 sm:p-5 mx-2 sm:mx-auto sm:max-w-md">
          {/* Заголовок */}
          <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4">
            Подтвердить выбор?
          </p>

          {/* Кнопки */}
          <div className="flex gap-3">
            {/* Кнопка отмены (красная) */}
            <button
              onClick={cancelSelection}
              className="flex-1 h-12 rounded-xl bg-red-100 hover:bg-red-200 active:bg-red-300 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              aria-label="Отменить"
            >
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-red-700 font-medium">Отменить</span>
            </button>

            {/* Кнопка подтверждения (зелёная) */}
            <button
              onClick={confirmSelection}
              className="flex-1 h-12 rounded-xl bg-green-100 hover:bg-green-200 active:bg-green-300 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              aria-label="Подтвердить"
            >
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-700 font-medium">Подтвердить</span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes bottomSheetFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bottomSheetSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default ConfirmationButtons;
