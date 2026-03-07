import React from 'react';
import useGameStore from '../store/gameStore';
import { useStars } from '../hooks/useVKStorage';

/**
 * Модальное окно подтверждения использования подсказки
 */
export function HintModal() {
  const { showHintConfirmModal, setShowHintConfirmModal, showHint } = useGameStore();
  const { stars } = useStars();

  const HINT_COST = 5;

  // Если модальное окно не показано, не рендерим
  if (!showHintConfirmModal) {
    return null;
  }

  /**
   * Обработка подтверждения использования подсказки
   */
  const handleConfirm = async () => {
    setShowHintConfirmModal(false);
    await showHint();
  };

  /**
   * Обработка отмены
   */
  const handleCancel = () => {
    setShowHintConfirmModal(false);
  };

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        style={{
          animation: 'bottomSheetFadeIn 0.2s ease-out forwards',
        }}
        onClick={handleCancel}
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
          <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-2">
            Воспользоваться подсказкой?
          </p>

          {/* Стоимость */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-600 font-medium">Стоимость: {HINT_COST} звёзд</span>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            {/* Кнопка отмены (серая) */}
            <button
              onClick={handleCancel}
              className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Отменить"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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
              <span className="text-gray-700 font-medium">Отмена</span>
            </button>

            {/* Кнопка подтверждения (жёлтая) */}
            <button
              onClick={handleConfirm}
              disabled={stars < HINT_COST}
              className="flex-1 h-12 rounded-xl bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              aria-label="Подтвердить"
            >
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-700 font-medium">Использовать</span>
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

export default HintModal;
