import React from 'react';
import useGameStore from '../store/gameStore';
import { GamePhase } from '../store/gameStore';
import ConfirmationButtons from './ConfirmationButtons';

/**
 * Экран вопроса с таймером и прогрессом
 */
export function QuestionScreen() {
  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    score,
    timeLeft,
    streak,
  } = useGameStore();

  const countryName = currentQuestion?.properties?.NAME || 'Страна';
  const timerPercentage = (timeLeft / 90) * 100;
  const timerColor = timeLeft > 30 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500';

  /**
   * Возврат в главное меню
   */
  const handleBackToMenu = () => {
    useGameStore.setState({
      phase: GamePhase.START,
      score: 0,
      questionIndex: 0,
      correctAnswers: 0,
    });
  };

  return (
    <>
      {/* Верхняя панель */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 safe-area-top">
        <div className="max-w-md mx-auto space-y-2">
          {/* Первый ряд: В меню | Найдите страну | Счёт */}
          <div className="flex justify-between gap-2 sm:gap-3 mt-2">
            {/* Кнопка "В меню" */}
            <button
              onClick={handleBackToMenu}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 flex items-center gap-1.5 sm:gap-2"
              aria-label="В меню"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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

            {/* Найдите страну */}
            <div className="flex-1 text-center px-2 py-1 sm:px-3 sm:py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-white/30">
              <p className="text-[13px] sm:text-sm text-gray-500">Найдите</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">{countryName}</p>
            </div>

            {/* Счёт */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-[5px_15px]">
              <p className="text-xs sm:text-sm text-blue-200">Счёт</p>
              <p className="text-[16px] sm:text-xl font-bold text-white text-center">{score}</p>
            </div>
          </div>

          {/* Второй ряд: Прогрессбар на всю ширину */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs sm:text-sm text-white mb-1">
              <span className='block w-fit mx-auto'>Вопрос {questionIndex + 1}/{totalQuestions}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таймер */}
      <div className="absolute bottom-5 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs sm:text-sm text-white mb-2">
            <span>Время</span>
            <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : ''}`}>
              {timeLeft}с
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full ${timerColor} transition-all duration-100 ease-linear`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Кнопки подтверждения/отмены выбора страны */}
      <ConfirmationButtons />
    </>
  );
}

export default QuestionScreen;
