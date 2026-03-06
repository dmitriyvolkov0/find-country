import React, { useState, useCallback, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore, { GamePhase } from './store/gameStore';
import { useVKStorage } from './hooks/useVKStorage';
import { useGameEngine, useResponsive } from './hooks/useGameEngine';
import Globe3D from './components/Globe3D';
import StartScreen from './components/StartScreen';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import QuestionScreen from './components/QuestionScreen';
import FeedbackScreen from './components/FeedbackScreen';
import GameOverScreen from './components/GameOverScreen';
import ViewScreen from './components/ViewScreen';

/**
 * Корневой компонент приложения
 * Инициализирует VK Bridge, загружает данные и управляет состоянием игры
 */
export default function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const phase = useGameStore((state) => state.phase);
  const startGame = useGameStore((state) => state.startGame);
  const nextQuestion = useGameStore((state) => state.nextQuestion);
  const selectCountry = useGameStore((state) => state.selectCountry);
  const loadSavedStats = useGameStore((state) => state.loadSavedStats);
  const savedStats = useGameStore((state) => state.savedStats);
  const clearHighlightedCountries = useGameStore((state) => state.clearHighlightedCountries);
  const startViewMode = useGameStore((state) => state.startViewMode);
  const stopViewMode = useGameStore((state) => state.stopViewMode);
  const setPhase = useGameStore((state) => state.setPhase);

  const { save: saveStats } = useVKStorage();

  /**
   * Обработка завершения игры
   */
  const handleGameComplete = useCallback(async (stats) => {
    try {
      // Не сохраняем, если игрок набрал 0 очков за игру
      if (stats.score === 0) {
        return;
      }
    
      // Загружаем предыдущие данные из store или используем значения по умолчанию
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

      // Сохраняем напрямую через VK Bridge
      await vkBridge.send('VKWebAppStorageSet', {
        key: 'mapit_game_stats',
        value: JSON.stringify(newStats),
      });

      // Обновляем состояние в store
      loadSavedStats(newStats);
    } catch (err) {

    }
  }, [savedStats, loadSavedStats]);

  /**
   * Хук игровой логики
   */
  useGameEngine(handleGameComplete, savedStats);

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
   * Инициализация VK Bridge и загрузка статистики
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загрузка сохранённой статистики из VK Storage
        const statsResult = await vkBridge.send('VKWebAppStorageGet', {
          keys: ['mapit_game_stats'],
        });

        // VK Storage возвращает { keys: [{ key, value }] }
        const statsValue = statsResult?.keys?.[0]?.value;
        if (statsValue) {
          const stats = JSON.parse(statsValue);
          loadSavedStats(stats);
        }

        // Загрузка настроек из VK Storage
        const settingsResult = await vkBridge.send('VKWebAppStorageGet', {
          keys: ['mapit_settings'],
        });

        const settingsValue = settingsResult?.keys?.[0]?.value;
        if (settingsValue) {
          const settings = JSON.parse(settingsValue);
          useGameStore.getState().updateSettings(settings);
        }
      } catch (err) {
        
      }
    };

    loadData();
  }, []);

  /**
   * Переход к экрану выбора режима
   */
  const handlePlay = useCallback(() => {
    setPhase(GamePhase.MODE_SELECTION);
  }, [setPhase]);

  /**
   * Начало игры с выбранным режимом
   */
  const handleStart = useCallback(async (mode) => {
    await startGame(mode);
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
    clearHighlightedCountries();
    nextQuestion();
  }, [nextQuestion, clearHighlightedCountries]);

  /**
   * Возврат в главное меню
   */
  const handleBackToMenu = useCallback(() => {
    clearHighlightedCountries();
    useGameStore.setState({
      phase: GamePhase.START,
      gameMode: null,
      score: 0,
      questionIndex: 0,
      correctAnswers: 0,
    });
  }, [clearHighlightedCountries]);

  /**
   * Вход в режим просмотра
   */
  const handleViewMode = useCallback(async () => {
    await startViewMode();
  }, [startViewMode]);

  /**
   * Выход из режима просмотра
   */
  const handleExitViewMode = useCallback(() => {
    stopViewMode();
  }, [stopViewMode]);

  /**
   * Рендер в зависимости от фазы игры
   */
  const renderPhase = () => {
    switch (phase) {
      case GamePhase.START:
        return <StartScreen onPlay={handlePlay} onViewMode={handleViewMode} />;

      case GamePhase.MODE_SELECTION:
        return (
          <ModeSelectionScreen
            onModeSelect={handleStart}
            onBack={() => setPhase(GamePhase.START)}
          />
        );

      case GamePhase.QUESTION:
        return <QuestionScreen />;

      case GamePhase.FEEDBACK:
        return <FeedbackScreen onNext={handleNext} />;

      case GamePhase.GAME_OVER:
        return (
          <GameOverScreen
            onRestart={() => handleStart(useGameStore.getState().gameMode)}
            onBackToMenu={handleBackToMenu}
          />
        );

      case GamePhase.VIEW:
        return <ViewScreen onExit={handleExitViewMode} />;

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
