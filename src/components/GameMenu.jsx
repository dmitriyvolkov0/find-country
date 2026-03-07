import React, { useState } from 'react';
import useGameStore from '../store/gameStore';
import { useStars } from '../hooks/useVKStorage';

/**
 * Кнопка игрового меню с выпадающим списком действий
 */
export function GameMenu() {
  const { phase, setShowHintConfirmModal, setShowTimeBonusConfirmModal, setShowChangeCountryConfirmModal } = useGameStore();
  const { stars } = useStars();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Показываем кнопку только в режиме вопроса
  if (phase !== 'question') {
    return null;
  }

  const HINT_COST = 5;
  const TIME_BONUS_COST = 5;
  const CHANGE_COUNTRY_COST = 2;
  const hasEnoughStarsForHint = stars >= HINT_COST;
  const hasEnoughStarsForTimeBonus = stars >= TIME_BONUS_COST;
  const hasEnoughStarsForChangeCountry = stars >= CHANGE_COUNTRY_COST;

  /**
   * Обработка клика по кнопке меню
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Закрытие меню
   */
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  /**
   * Обработка выбора подсказки
   */
  const handleHint = () => {
    closeMenu();
    if (hasEnoughStarsForHint) {
      setShowHintConfirmModal(true);
    } else {
      // Закрываем меню и показываем модальное окно недостатка звёзд
      useGameStore.getState().setShowInsufficientStarsModal(true);
    }
  };

  /**
   * Обработка выбора +30 секунд
   */
  const handleTimeBonus = () => {
    closeMenu();
    if (hasEnoughStarsForTimeBonus) {
      setShowTimeBonusConfirmModal(true);
    } else {
      // Закрываем меню и показываем модальное окно недостатка звёзд
      useGameStore.getState().setShowInsufficientStarsModal(true);
    }
  };

  /**
   * Обработка выбора смены страны
   */
  const handleChangeCountry = () => {
    closeMenu();
    if (hasEnoughStarsForChangeCountry) {
      setShowChangeCountryConfirmModal(true);
    } else {
      // Закрываем меню и показываем модальное окно недостатка звёзд
      useGameStore.getState().setShowInsufficientStarsModal(true);
    }
  };

  return (
    <>
      {/* Кнопка меню */}
      <button
        onClick={toggleMenu}
        className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 z-10 p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500"
        aria-label="Меню"
        title="Меню"
      >
        {/* Иконка меню (три точки) */}
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isMenuOpen && (
        <>
          {/* Затемнение фона */}
          <div
            className="fixed inset-0 z-20"
            onClick={closeMenu}
          />

          {/* Панель меню */}
          <div className="absolute bottom-40 right-4 sm:right-6 z-30 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Кнопка подсказки */}
            <button
              onClick={handleHint}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800 text-sm">Подсказка</p>
                <p className="text-xs text-gray-500">{HINT_COST} звёзд</p>
              </div>
            </button>

            {/* Разделитель */}
            <div className="h-px bg-gray-200 mx-3" />

            {/* Кнопка +30 секунд */}
            <button
              onClick={handleTimeBonus}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800 text-sm">+30 секунд</p>
                <p className="text-xs text-gray-500">{TIME_BONUS_COST} звёзд</p>
              </div>
            </button>

            {/* Разделитель */}
            <div className="h-px bg-gray-200 mx-3" />

            {/* Кнопка смены страны */}
            <button
              onClick={handleChangeCountry}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800 text-sm">Сменить страну</p>
                <p className="text-xs text-gray-500">{CHANGE_COUNTRY_COST} звезды</p>
              </div>
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default GameMenu;
