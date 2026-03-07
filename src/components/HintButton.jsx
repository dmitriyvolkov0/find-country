import React from 'react';
import useGameStore from '../store/gameStore';
import { useStars } from '../hooks/useVKStorage';

/**
 * Кнопка вызова подсказки (размещается внизу справа)
 */
export function HintButton() {
  const { phase, setShowHintConfirmModal } = useGameStore();
  const { stars } = useStars();

  // Показываем кнопку только в режиме вопроса
  if (phase !== 'question') {
    return null;
  }

  const HINT_COST = 5;
  const hasEnoughStars = stars >= HINT_COST;

  /**
   * Обработка клика по кнопке подсказки
   */
  const handleClick = () => {
    if (hasEnoughStars) {
      // Показываем модальное окно подтверждения
      setShowHintConfirmModal(true);
    } else {
      // Показываем модальное окно недостатка звёзд
      useGameStore.getState().setShowInsufficientStarsModal(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute bottom-20 right-4 sm:bottom-24 sm:right-6 z-10 p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-blue-900 ${
        hasEnoughStars
          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500'
          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed'
      }`}
      aria-label="Подсказка"
      title={hasEnoughStars ? `Подсказка (${HINT_COST} звёзд)` : 'Недостаточно звёзд'}
    >
      {/* Иконка лампочки/подсказки */}
      <svg
        className={`w-6 h-6 sm:w-7 sm:h-7 ${
          hasEnoughStars ? 'text-white' : 'text-gray-300'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    </button>
  );
}

export default HintButton;
