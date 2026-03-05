import { useEffect, useCallback, useRef, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore, { GamePhase } from '../store/gameStore';

/**
 * Хук для управления игровой логикой
 * Обрабатывает таймер, вибрацию, сохранение прогресса
 */
export function useGameEngine(onGameComplete) {
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
  } = useGameStore();

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

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
   * Обработка истечения времени
   */
  const handleTimeUp = useCallback(() => {
    stopTimer();
    vibrate('error');
  }, [stopTimer, vibrate]);

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
  }, [timerActive, phase, timeLeft, updateTimer, handleTimeUp]);

  /**
   * Сохранение статистики при завершении игры
   */
  useEffect(() => {
    if (phase === GamePhase.GAME_OVER && onGameComplete) {
      const stats = {
        score,
        correctAnswers,
        totalQuestions,
        maxStreak,
        accuracy: Math.round((correctAnswers / totalQuestions) * 100),
        timestamp: Date.now(),
      };
      onGameComplete(stats);
    }
  }, [phase, score, correctAnswers, totalQuestions, maxStreak, onGameComplete]);

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
