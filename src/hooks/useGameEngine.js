import { useEffect, useCallback, useRef, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore, { GamePhase, GameMode } from '../store/gameStore';

/**
 * Хук для управления игровой логикой
 * Обрабатывает таймер, вибрацию, сохранение прогресса
 */
export function useGameEngine(onGameComplete, savedStats) {
  const {
    phase,
    timeLeft,
    timerActive,
    score,
    correctAnswers,
    streak,
    maxStreak,
    questionIndex,
    totalQuestions,
    currentQuestion,
    settings,
    updateTimer,
    stopTimer,
    selectCountry,
    gameMode,
  } = useGameStore();

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const prevTimeLeftRef = useRef(timeLeft);
  const statsSavedRef = useRef(false);

  /**
   * Вибрация при событиях (через VK Bridge)
   */
  const vibrate = useCallback(async (type = 'light') => {
    if (!settings.vibrationsEnabled) return;

    try {
      if (vkBridge.isWebView()) {
        await vkBridge.send('VKWebAppTapticNotificationOccurred', { type });
      } else {
        // Fallback для браузера
        if (navigator.vibrate) {
          const patterns = {
            light: [10],
            medium: [30],
            heavy: [50],
            error: [50, 50, 50],
            success: [100],
          };
          navigator.vibrate(patterns[type] || patterns.light);
        }
      }
    } catch (err) {
      console.log('Vibration not supported:', err);
    }
  }, [settings.vibrationsEnabled]);

  /**
   * Обработка истечения времени - завершение раунда
   */
  const handleTimeUp = useCallback(() => {
    stopTimer();
    vibrate('error');
    
    // Устанавливаем флаг неправильного ответа и подсвечиваем правильную страну
    useGameStore.setState({
      phase: GamePhase.FEEDBACK,
      timerActive: false,
      isCorrect: false,
      highlightedCountries: [
        { country: currentQuestion, color: 'green' },
      ],
    });
    
    // Перемещаем камеру на правильную страну
    const event = new CustomEvent('focusOnCountry', {
      detail: { country: currentQuestion }
    });
    window.dispatchEvent(event);
    
    // Переходим к следующему вопросу с задержкой
    setTimeout(() => {
      useGameStore.getState().nextQuestion();
    }, 2500);
  }, [stopTimer, vibrate, currentQuestion]);

  /**
   * Таймер обратного отсчёта
   */
  useEffect(() => {
    if (!timerActive || phase !== GamePhase.QUESTION) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, timeLeft - elapsed);

      updateTimer(remaining);

      // Вибрация-предупреждение за 30 и 10 секунд
      if (prevTimeLeftRef.current > 30 && remaining === 30) {
        vibrate('error');
      }
      if (prevTimeLeftRef.current > 10 && remaining === 10) {
        vibrate('error');
      }

      prevTimeLeftRef.current = remaining;

      if (remaining <= 0) {
        handleTimeUp();
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerActive, phase, timeLeft, updateTimer, handleTimeUp, vibrate]);

  /**
   * Сохранение рекорда после каждого раунда (если текущий счёт лучше предыдущего)
   */
  useEffect(() => {
    // Сохраняем после правильного ответа в фазе FEEDBACK
    if (phase === GamePhase.FEEDBACK && score > 0 && savedStats && score > savedStats.bestScore) {
      const stats = {
        score,
        correctAnswers,
        totalQuestions,
        maxStreak,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        timestamp: Date.now(),
      };
      onGameComplete(stats);
    }
  }, [phase, score, correctAnswers, totalQuestions, maxStreak, onGameComplete, savedStats]);

  /**
   * Сохранение статистики при завершении игры
   */
  useEffect(() => {
    if (phase === GamePhase.GAME_OVER && onGameComplete && !statsSavedRef.current) {
      statsSavedRef.current = true; // Помечаем, что статистика сохранена

      const stats = {
        score,
        correctAnswers,
        totalQuestions: gameMode === GameMode.ENDLESS ? questionIndex : totalQuestions,
        maxStreak,
        accuracy: gameMode === GameMode.ENDLESS && questionIndex > 0
          ? Math.round((correctAnswers / questionIndex) * 100)
          : Math.round((correctAnswers / totalQuestions) * 100),
        timestamp: Date.now(),
      };
      onGameComplete(stats);
    }
  }, [phase, score, correctAnswers, totalQuestions, maxStreak, onGameComplete, gameMode, questionIndex]);

  /**
   * Обработка событий VK Bridge
   */
  useEffect(() => {
    const handleLocationChange = (e) => {
      // Пауза при сворачивании приложения
      if (e.detail.location === 'background') {
        stopTimer();
      }
    };

    vkBridge.subscribe('VKWebAppLocationChanged', handleLocationChange);

    return () => {
      vkBridge.unsubscribe('VKWebAppLocationChanged', handleLocationChange);
    };
  }, [stopTimer]);

  // Сбрасываем флаг сохранения при начале нового вопроса (новая игра)
  useEffect(() => {
    if (phase === GamePhase.QUESTION && questionIndex === 0) {
      statsSavedRef.current = false;
    }
  }, [phase, questionIndex]);

  return {
    timeLeft,
    score,
    correctAnswers,
    streak,
    maxStreak,
    questionIndex,
    totalQuestions,
    currentQuestion,
    phase,
    vibrate,
  };
}

/**
 * Хук для определения характеристик устройства
 */
export function useResponsive() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    pixelRatio: 1,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const isMobile = width < 481;
      const isTablet = width >= 481 && width < 1025;
      const isDesktop = width >= 1025;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        pixelRatio: window.devicePixelRatio || 1,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);

    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

export default useGameEngine;
