import React, { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';

/**
 * Экран обратной связи после ответа
 */
export function FeedbackScreen({ onNext }) {
  const {
    selectedCountry,
    currentQuestion,
    isCorrect,
    score,
    timeLeft,
    highlightedCountries,
  } = useGameStore();

  const [isVisible, setIsVisible] = useState(false);

  const selectedName = selectedCountry?.properties?.NAME || 'Страна';
  const targetName = currentQuestion?.properties?.NAME || 'Страна';
  const pointsEarned = isCorrect ? Math.round(100 + Math.min(score % 5, 5) * 20 + timeLeft * 5) : 0;

  useEffect(() => {
    // Показываем модальное окно с задержкой, чтобы игрок увидел подсветку стран
    const hasHighlight = highlightedCountries && highlightedCountries.length > 0;
    const hasErrorHighlight = highlightedCountries?.some(h => h.color === 'red');
    
    // Если есть подсветка ошибочной страны, ждём дольше (пока не покажется правильная)
    const delay = hasErrorHighlight ? 2000 : 500;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [highlightedCountries]);

  useEffect(() => {
    // Автоматический переход к следующему вопросу после показа окна
    if (isVisible) {
      const timer = setTimeout(() => {
        onNext();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onNext]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className={`text-center px-4 max-w-md w-full mx-auto mb-20 transition-all duration-500 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}>
        {/* Анимация результата */}
        <div className={`p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-sm ${
          isCorrect
            ? 'bg-green-500/90 border-2 border-green-300'
            : 'bg-red-500/90 border-2 border-red-300'
        }`}>
          {/* Иконка */}
          <div className="text-5xl sm:text-6xl mb-3">
            {isCorrect ? '✅' : '❌'}
          </div>

          {/* Заголовок */}
          <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${
            isCorrect ? 'text-white' : 'text-white'
          }`}>
            {isCorrect ? 'Правильно!' : 'Неверно!'}
          </h3>

          {/* Информация */}
          <div className="text-white/90 space-y-2">
            {!isCorrect && (
              <>
                <p className="text-sm sm:text-base">
                  Вы выбрали: <span className="font-semibold">{selectedName}</span>
                </p>
                <p className="text-sm sm:text-base">
                  Правильный ответ: <span className="font-semibold">{targetName}</span>
                </p>
              </>
            )}

            {isCorrect && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-green-200 text-sm">+{pointsEarned} очков</span>
              </div>
            )}
          </div>
        </div>

        {/* Индикатор загрузки */}
        {isVisible && (
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackScreen;
