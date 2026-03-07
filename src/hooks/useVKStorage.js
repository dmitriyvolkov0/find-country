import { useState, useCallback } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import useGameStore from '../store/gameStore';

const STORAGE_KEY = 'mapit_game_stats';
const STARS_KEY = 'mapit_stars';

/**
 * Хук для работы с VK Storage
 * Возвращает данные, состояние загрузки и методы для сохранения/загрузки
 */
export function useVKStorage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка данных из VK Storage
   */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await vkBridge.send('VKWebAppStorageGet', {
        keys: [STORAGE_KEY],
      });

      // VK Storage возвращает { keys: [{ key, value }] }
      const value = result.keys?.[0]?.value;
      if (value) {
        const parsed = JSON.parse(value);
        setData(parsed);
        return parsed;
      }
      return null;
    } catch (err) {
      console.error('VK Storage load error!');
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Сохранение данных в VK Storage
   */
  const save = useCallback(async (newData) => {
    try {
      setError(null);
      setData(newData);

      await vkBridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify(newData),
      });

      return true;
    } catch (err) {
      console.error('VK Storage save error:', err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Очистка данных
   */
  const clear = useCallback(async () => {
    try {
      // Удаляем ключ, устанавливая пустое значение
      await vkBridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: '',
      });
      setData(null);
      return true;
    } catch (err) {
      console.error('VK Storage clear error:', err);
      return false;
    }
  }, []);

  return { data, loading, error, load, save, clear };
}

/**
 * Хук для работы с настройками (управление через gameStore)
 */
export function useSettings() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationsEnabled: true,
    language: 'ru',
  });

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  }, []);

  return { settings, updateSettings };
}

/**
 * Хук для управления звёздами (валюта игры)
 */
export function useStars() {
  const stars = useGameStore((state) => state.stars);
  const setStars = useGameStore((state) => state.setStars);

  /**
   * Добавление звёзд
   */
  const addStars = useCallback(async (amount) => {
    const newStars = stars + amount;
    setStars(newStars);

    try {
      await vkBridge.send('VKWebAppStorageSet', {
        key: STARS_KEY,
        value: String(newStars),
      });
      return true;
    } catch (err) {
      console.error('Stars save error:', err);
      return false;
    }
  }, [stars, setStars]);

  /**
   * Трата звёзд
   */
  const spendStars = useCallback(async (amount) => {
    if (stars < amount) {
      return false; // Недостаточно звёзд
    }

    const newStars = stars - amount;
    setStars(newStars);

    try {
      await vkBridge.send('VKWebAppStorageSet', {
        key: STARS_KEY,
        value: String(newStars),
      });
      return true;
    } catch (err) {
      console.error('Stars spend error:', err);
      return false;
    }
  }, [stars, setStars]);

  return { stars, addStars, spendStars };
}

export default useVKStorage;
