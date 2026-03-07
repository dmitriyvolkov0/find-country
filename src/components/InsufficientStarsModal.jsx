import React from 'react';
import useGameStore from '../store/gameStore';
import vkBridge from '@vkontakte/vk-bridge';

/**
 * Модальное окно недостатка звёзд с предложением посмотреть рекламу
 */
export function InsufficientStarsModal() {
  const { showInsufficientStarsModal, setShowInsufficientStarsModal, setStars } = useGameStore();

  const REWARD_AMOUNT = 20;

  // Если модальное окно не показано, не рендерим
  if (!showInsufficientStarsModal) {
    return null;
  }

  /**
   * Обработка просмотра рекламы
   */
  const handleWatchAd = async () => {
    try {
      // Показываем рекламу через VK Bridge
      const result = await vkBridge.send('VKWebAppShowNativeAds', {
        ad_format: 'interstitial',
      });

      // Если реклама успешно показана, начисляем звёзды
      if (result.result) {
        // Получаем текущее количество звёзд и добавляем reward
        const currentStars = useGameStore.getState().stars;
        const newStars = currentStars + REWARD_AMOUNT;
        
        // Обновляем в store
        setStars(newStars);

        // Сохраняем в VK Storage
        await vkBridge.send('VKWebAppStorageSet', {
          key: 'mapit_stars',
          value: String(newStars),
        });

        // Закрываем модальное окно
        setShowInsufficientStarsModal(false);
      }
    } catch (err) {
      // Ошибка показа рекламы или пользователь закрыл её
      console.error('Ad show error:', err);
      // Закрываем модальное окно в любом случае
      setShowInsufficientStarsModal(false);
    }
  };

  /**
   * Обработка закрытия
   */
  const handleClose = () => {
    setShowInsufficientStarsModal(false);
  };

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        style={{
          animation: 'bottomSheetFadeIn 0.2s ease-out forwards',
        }}
        onClick={handleClose}
      />

      {/* Панель выезжает снизу */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50"
        style={{
          animation: 'bottomSheetSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl p-4 sm:p-5 mx-2 sm:mx-auto sm:max-w-md">
          {/* Заголовок */}
          <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-2">
            Недостаточно звёзд!
          </p>

          {/* Текст */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-4">
            Посмотрите рекламу и получите {REWARD_AMOUNT} звёзд
          </p>

          {/* Кнопки */}
          <div className="flex gap-3">
            {/* Кнопка закрытия (серая) */}
            <button
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Закрыть"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-gray-700 font-medium">Закрыть</span>
            </button>

            {/* Кнопка просмотра рекламы (синяя) */}
            <button
              onClick={handleWatchAd}
              className="flex-1 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 active:bg-blue-300 flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              aria-label="Посмотреть рекламу"
            >
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-blue-700 font-medium">Смотреть</span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes bottomSheetFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bottomSheetSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default InsufficientStarsModal;
