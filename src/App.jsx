import React, { useState, useCallback, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore, { GamePhase } from './store/gameStore';
import { useVKStorage, useSettings } from './hooks/useVKStorage';
import { useGameEngine, useResponsive } from './hooks/useGameEngine';
import Globe3D from './components/Globe3D';
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import FeedbackScreen from './components/FeedbackScreen';
import GameOverScreen from './components/GameOverScreen';

/**
 * Корневой компонент приложения Map It!
 * Инициализирует VK Bridge, загружает данные и управляет состоянием игры
 */
export default function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const {
    phase,
    startGame,
    nextQuestion,
    selectCountry,
    loadSavedStats,
    savedStats,
  } = useGameStore();

  const { save: saveStats } = useVKStorage();
  const { settings } = useSettings();

  /**
   * Обработка завершения игры
   */
  const handleGameComplete = useCallback(async (stats) => {
    try {
      // Загружаем предыдущие данные
      const previousStats = savedStats || {
        bestScore: 0,
        bestAccuracy: 0,
        totalGames: 0,
        totalScore: 0,
      };

      // Обновляем статистику
      const newStats = {
        bestScore: Math.max(previousStats.bestScore, stats.score),
        bestAccuracy: Math.max(previousStats.bestAccuracy, stats.accuracy),
        totalGames: previousStats.totalGames + 1,
        totalScore: previousStats.totalScore + stats.score,
        lastPlayed: Date.now(),
      };

      // Сохраняем в VK Storage
      await saveStats(newStats);
      loadSavedStats(newStats);
    } catch (err) {
      console.error('Error saving stats:', err);
    }
  }, [savedStats, saveStats, loadSavedStats]);

  /**
   * Хук игровой логики
   */
  useGameEngine(handleGameComplete);

  /**
   * Загрузка данных о странах (теперь внутри Globe3D)
   * Устанавливаем флаг готовности после монтирования
   */
  useEffect(() => {
    // Небольшая задержка для инициализации Globe3D
    const timer = setTimeout(() => {
      setIsDataLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Инициализация VK Bridge
   */
  useEffect(() => {
    const initVK = async () => {
      // Проверяем, работает ли VK Storage
      if (vkBridge.isWebView()) {
        try {
          // Загрузка сохранённой статистики
          const result = await vkBridge.send('VKWebAppStorageGet', {
            keys: ['mapit_game_stats'],
          });
          
          const value = result?.data?.[0]?.value;
          if (value) {
            const stats = JSON.parse(value);
            loadSavedStats(stats);
          }
        } catch (storageErr) {
          console.log('VK Storage error:', storageErr);
          // Fallback на localStorage
          const localStats = localStorage.getItem('mapit_game_stats');
          if (localStats) {
            loadSavedStats(JSON.parse(localStats));
          }
        }
      } else {
        // Не VK WebView - используем localStorage
        const localStats = localStorage.getItem('mapit_game_stats');
        if (localStats) {
          loadSavedStats(JSON.parse(localStats));
        }
      }
    };

    initVK();
  }, []);

  /**
   * Начало игры
   */
  const handleStart = useCallback(async () => {
    await startGame(null);
  }, [startGame]);

  /**
   * Обработка выбора страны
   */
  const handleCountryClick = useCallback((country) => {
    selectCountry(country);
  }, [selectCountry]);

  /**
   * Переход к следующему вопросу
   */
  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  /**
   * Возврат в главное меню
   */
  const handleBackToMenu = useCallback(() => {
    useGameStore.setState({
      phase: GamePhase.START,
      score: 0,
      questionIndex: 0,
      correctAnswers: 0,
    });
  }, []);

  /**
   * Рендер в зависимости от фазы игры
   */
  const renderPhase = () => {
    switch (phase) {
      case GamePhase.START:
        return <StartScreen onStart={handleStart} />;
      
      case GamePhase.QUESTION:
        return <QuestionScreen />;
      
      case GamePhase.FEEDBACK:
        return <FeedbackScreen onNext={handleNext} />;
      
      case GamePhase.GAME_OVER:
        return (
          <GameOverScreen 
            onRestart={handleStart} 
            onBackToMenu={handleBackToMenu} 
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Глобус */}
      <div className="absolute inset-0">
        {isDataLoaded && (
          <Globe3D 
            onCountryClick={handleCountryClick}
          />
        )}
      </div>

      {/* UI слой */}
      {renderPhase()}

      {/* Safe area insets для iOS */}
      <style>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </div>
  );
}
