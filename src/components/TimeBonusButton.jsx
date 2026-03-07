import React from 'react';
import useGameStore from '../store/gameStore';
import { useStars } from '../hooks/useVKStorage';

/**
 * Кнопка добавления +30 секунд ко времени (размещается внизу справа)
 */
export function TimeBonusButton() {
  const { phase, setShowTimeBonusConfirmModal } = useGameStore();
  const { stars } = useStars();

  // Показываем кнопку только в режиме вопроса
  if (phase !== 'question') {
    return null;
  }

  const TIME_BONUS_COST = 5;
  const hasEnoughStars = stars >= TIME_BONUS_COST;

  /**
   * Обработка клика по кнопке +30 секунд
   */
  const handleClick = () => {
    if (hasEnoughStars) {
      // Показываем модальное окно подтверждения
      setShowTimeBonusConfirmModal(true);
    } else {
      // Показываем модальное окно недостатка звёзд
      useGameStore.getState().setShowInsufficientStarsModal(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute bottom-20 left-4 sm:bottom-24 sm:left-6 z-10 p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-blue-900 ${
        hasEnoughStars
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed'
      }`}
      aria-label="Добавить 30 секунд"
      title={hasEnoughStars ? `+30 секунд (${TIME_BONUS_COST} звёзд)` : 'Недостаточно звёзд'}
    >
      {/* Иконка часов/времени */}
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  );
}

export default TimeBonusButton;
