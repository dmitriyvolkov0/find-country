import { useState, useCallback } from 'react';
import vkBridge from '@vkontakte/vk-bridge';

const STORAGE_KEY = 'mapit_game_stats';

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
      await vkBridge.send('VKWebAppStorageDelete', {
        keys: [STORAGE_KEY],
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

export default useVKStorage;
