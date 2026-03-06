import React from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore, { GameMode, GAME_MODE_CONFIG } from '../store/gameStore';

/**
 * Экран завершения игры с результатами
 */
export function GameOverScreen({ onRestart, onBackToMenu }) {
  const {
    score,
    correctAnswers,
    totalQuestions,
    maxStreak,
    savedStats,
    gameMode,
    questionIndex,
  } = useGameStore();

  const accuracy = totalQuestions > 0 && gameMode !== GameMode.ENDLESS
    ? Math.round((correctAnswers / questionIndex) * 100) 
    : 0;
  const isNewRecord = !savedStats || score > (savedStats.bestScore || 0);
  
  // Получаем конфигурацию режима
  const modeConfig = gameMode ? GAME_MODE_CONFIG[gameMode] : null;
  
  // Для бесконечного режима показываем, сколько вопросов пройдено
  const questionsAnswered = questionIndex;
  const isEndlessMode = gameMode === GameMode.ENDLESS;

  // Определение ранга в зависимости от точности
  const getRank = () => {
    if (accuracy >= 90) return { title: '🏆 Мастер карт', color: 'text-yellow-400' };
    if (accuracy >= 70) return { title: '🌟 Географ', color: 'text-blue-400' };
    if (accuracy >= 50) return { title: '📚 Ученик', color: 'text-green-400' };
    return { title: '🗺️ Путешественник', color: 'text-purple-400' };
  };

  const rank = getRank();
  
  // Сообщение в зависимости от режима
  const getTitle = () => {
    if (isEndlessMode) {
      return `Игра завершена!`;
    }
    return 'Игра окончена!';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-30">
      <div className="text-center px-4 sm:px-6 max-w-md w-full mx-auto">
        {/* Заголовок */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {getTitle()}
        </h2>

        {/* Режим игры */}
        {modeConfig && (
          <div className="mb-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 inline-block">
            <span className="text-white/80 text-sm sm:text-base">
              {modeConfig.icon} {modeConfig.name}
            </span>
          </div>
        )}

        {/* Новый рекорд */}
        {isNewRecord && score > 0 && !isEndlessMode && (
          <div className="mb-4 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-400/30 inline-block">
            <span className="text-yellow-300 text-sm sm:text-base font-medium">
              🎉 Новый рекорд!
            </span>
          </div>
        )}
        
        {/* Ранг (только для не бесконечного режима) */}
        {!isEndlessMode && (
          <div className={`text-lg sm:text-xl font-semibold mb-6 ${rank.color}`}>
            {rank.title}
          </div>
        )}

        {/* Результаты */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-blue-200 text-xs sm:text-sm mb-1">Счёт</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{score}</p>
          </div>
          {isEndlessMode ? (
            <>
              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-blue-200 text-xs sm:text-sm mb-1">Вопросов</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{questionsAnswered}</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-blue-200 text-xs sm:text-sm mb-1">Правильно</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{correctAnswers}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-blue-200 text-xs sm:text-sm mb-1">Точность</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{accuracy}%</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-blue-200 text-xs sm:text-sm mb-1">Правильно</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{correctAnswers}/{totalQuestions}</p>
              </div>
            </>
          )}
          <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-blue-200 text-xs sm:text-sm mb-1">Серия</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">🔥{maxStreak}</p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-indigo-900"
          >
            Играть снова
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium text-base rounded-xl border border-white/20 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-indigo-900"
          >
            В главное меню
          </button>
        </div>

        {/* Поделиться результатом */}
        {!isEndlessMode && (
          <div className="mt-6">
            <button
              onClick={() => shareResult(score, accuracy, totalQuestions)}
              className="text-blue-200 hover:text-white text-sm sm:text-base transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Поделиться результатом
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Поделиться результатом через VK Share
 */
async function shareResult(score, accuracy, totalQuestions) {
  try {
    await vkBridge.send('VKWebAppShare', {
      link: `Я набрал ${score} очков в "Найди страну"! Моя точность: ${accuracy}%`,
    });
  } catch (err) {
    // Fallback: копирование в буфер
    const text = `Я набрал ${score} очков в "Найди страну"! Моя точность: ${accuracy}% (${totalQuestions} вопросов). Попробуй побить мой рекорд!`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Результат скопирован в буфер обмена!');
    } catch {
      alert(text);
    }
  }
}

export default GameOverScreen;
