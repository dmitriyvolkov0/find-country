import React from 'react';
import useGameStore from '../store/gameStore';

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
  const timerPercentage = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      {/* Верхняя панель */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 safe-area-top">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Прогресс */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between text-xs sm:text-sm text-white mb-1">
              <span>Вопрос {questionIndex + 1}/{totalQuestions}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Счёт */}
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-xs sm:text-sm text-blue-200">Счёт</p>
            <p className="text-lg sm:text-xl font-bold text-white">{score}</p>
          </div>
        </div>
      </div>

      {/* Задание */}
      <div className="absolute top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-10 px-4 w-full max-w-md">
        <div className="text-center p-3 sm:p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/30">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Найдите страну</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            {countryName}
          </h2>
          {streak > 1 && (
            <div className="mt-2 inline-flex items-center px-2 py-1 bg-orange-100 rounded-full">
              <span className="text-orange-600 text-xs sm:text-sm font-medium">
                🔥 Серия: {streak}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Таймер */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 safe-area-bottom">
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
    </>
  );
}

export default QuestionScreen;
