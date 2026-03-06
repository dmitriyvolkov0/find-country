import { create } from 'zustand';

/**
 * Состояния игры
 */
export const GamePhase = {
  START: 'start',
  MODE_SELECTION: 'mode_selection',
  QUESTION: 'question',
  FEEDBACK: 'feedback',
  GAME_OVER: 'game_over',
  VIEW: 'view', // Режим просмотра
};

/**
 * Режимы игры
 */
export const GameMode = {
  QUICK: 'quick',       // 3 раунда
  STANDARD: 'standard', // 10 раундов
  ENDLESS: 'endless',   // Бесконечный режим
};

/**
 * Конфигурация режимов игры
 */
export const GAME_MODE_CONFIG = {
  [GameMode.QUICK]: {
    name: 'Быстрый',
    description: '3 раунда',
    rounds: 3,
    icon: '⚡',
    color: 'from-yellow-500 to-orange-600',
  },
  [GameMode.STANDARD]: {
    name: 'Обычный',
    description: '10 раундов',
    rounds: 10,
    icon: '🎯',
    color: 'from-blue-500 to-cyan-600',
  },
  [GameMode.ENDLESS]: {
    name: 'Бесконечный',
    description: 'Играй до ошибки',
    rounds: Infinity,
    icon: '♾️',
    color: 'from-purple-500 to-pink-600',
  },
};

// Глобальное хранилище данных о странах
let globalCountriesData = [];

/**
 * Загрузка данных о странах (вызывается из Globe3D)
 */
export async function loadCountriesData() {
  if (globalCountriesData.length > 0) {
    return globalCountriesData;
  }

  try {
    const response = await fetch('./src/datasets/ne_110m_admin_0_countries.geojson');
    const data = await response.json();
    
    // Фильтруем страны: убираем Антарктиду и мелкие территории
    globalCountriesData = data.features.filter(country => {
      const props = country.properties;
      return (
        props.CONTINENT !== 'Antarctica' &&
        props.POP_EST > 10000 &&
        (props.TYPE === 'Sovereign country' || props.TYPE === 'Country') &&
        props.NAME !== 'Antarctica'
      );
    });
    
    return globalCountriesData;
  } catch (err) {
    console.error('Error loading countries data:', err);
    return [];
  }
}

/**
 * Получить загруженные данные
 */
export function getCountriesData() {
  return globalCountriesData;
}

/**
 * Zustand store для управления состоянием игры
 */
const useGameStore = create((set, get) => ({
  // Состояние игры
  phase: GamePhase.START,

  // Режим игры
  gameMode: null,

  // Текущий вопрос
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 10,

  // Счёт и статистика
  score: 0,
  correctAnswers: 0,
  streak: 0,
  maxStreak: 0,

  // Таймер
  timeLeft: 90,
  timerActive: false,

  // Выбранная страна
  selectedCountry: null,
  pendingSelection: null, // Страна, ожидающая подтверждения пользователем
  showConfirmation: false, // Показывать ли модальное окно подтверждения
  isCorrect: null,

  // Подсветка стран (для визуальной обратной связи)
  highlightedCountries: [], // Массив объектов: { country, color: 'red' | 'green' }

  // Прогресс игры
  countriesData: [],
  usedCountries: [],

  // Сохранённые данные из VK Storage
  savedStats: null,

  // Настройки (localStorage)
  settings: {
    soundEnabled: true,
    vibrationsEnabled: true,
    language: 'ru',
  },

  // Действия
  setPhase: (phase) => set({ phase }),

  startGame: async (mode) => {
    // Определяем количество раундов в зависимости от режима
    const config = GAME_MODE_CONFIG[mode];
    const rounds = mode === GameMode.ENDLESS ? 1000 : config.rounds;

    // Загружаем данные о странах
    let dataToUse = await loadCountriesData();
    if (dataToUse.length === 0) {
      console.error('No countries data available');
      return;
    }

    // Перемешиваем и выбираем страны
    const shuffled = [...dataToUse].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(rounds, dataToUse.length));

    set({
      phase: GamePhase.QUESTION,
      gameMode: mode,
      currentQuestion: selected[0],
      questionIndex: 0,
      score: 0,
      correctAnswers: 0,
      streak: 0,
      maxStreak: 0,
      timeLeft: 90,
      timerActive: true,
      selectedCountry: null,
      isCorrect: null,
      countriesData: selected,
      usedCountries: [selected[0]],
      totalQuestions: rounds,
    });
  },

  startViewMode: async () => {
    set({
      phase: GamePhase.VIEW,
      currentQuestion: null,
      selectedCountry: null,
      pendingSelection: null,
      isCorrect: null,
      highlightedCountries: [],
      timerActive: false,
    });
  },

  stopViewMode: () => {
    set({
      phase: GamePhase.START,
      gameMode: null,
      currentQuestion: null,
      selectedCountry: null,
      pendingSelection: null,
    });
  },

  nextQuestion: () => {
    const { questionIndex, countriesData, usedCountries, gameMode } = get();
    const nextIndex = questionIndex + 1;

    // В бесконечном режиме игра продолжается бесконечно
    if (gameMode === GameMode.ENDLESS) {
      if (nextIndex >= countriesData.length) {
        // Если страны закончились, загружаем новые
        loadCountriesData().then(newData => {
          const shuffled = [...newData].sort(() => Math.random() - 0.5);
          set({
            countriesData: shuffled.slice(0, 100),
            usedCountries: [],
          });
        });
      }
    } else if (nextIndex >= countriesData.length) {
      // В обычном режиме заканчиваем игру
      set({ phase: GamePhase.GAME_OVER, timerActive: false });
      return;
    }

    // Выбираем следующую страну
    const available = countriesData.filter(c => !usedCountries.includes(c));
    const nextCountry = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : countriesData[nextIndex];

    set({
      phase: GamePhase.QUESTION,
      currentQuestion: nextCountry,
      questionIndex: nextIndex,
      timeLeft: 90,
      timerActive: true,
      selectedCountry: null,
      pendingSelection: null,
      isCorrect: null,
      usedCountries: [...usedCountries, nextCountry],
    });
  },

  selectCountry: (country) => {
    // Устанавливаем страну как ожидающую подтверждения с небольшой задержкой
    // для лучшего UX (пользователь видит результат клика перед появлением модального окна)
    setTimeout(() => {
      set({
        pendingSelection: country,
      });
    }, 200); // 400 мс задержка
  },

  confirmSelection: () => {
    const { pendingSelection, currentQuestion, streak, gameMode } = get();
    if (!pendingSelection) return;

    const isCorrect = pendingSelection?.properties?.ADM0_A3 === currentQuestion?.properties?.ADM0_A3;

    if (isCorrect) {
      // Правильный ответ — сразу переходим к FEEDBACK
      set({
        selectedCountry: pendingSelection,
        pendingSelection: null,
        isCorrect,
        phase: GamePhase.FEEDBACK,
        timerActive: false,
        score: get().score + calculateScore(streak, get().timeLeft),
        correctAnswers: get().correctAnswers + 1,
        streak: streak + 1,
        maxStreak: Math.max(get().maxStreak, streak + 1),
        highlightedCountries: [{ country: pendingSelection, color: 'green' }],
      });
    } else {
      // Ошибочный ответ
      if (gameMode === GameMode.ENDLESS) {
        // В бесконечном режиме просто показываем ошибку и продолжаем
        set({
          selectedCountry: pendingSelection,
          pendingSelection: null,
          isCorrect,
          phase: GamePhase.FEEDBACK,
          timerActive: false,
          streak: 0, // Сбрасываем серию
          highlightedCountries: [{ country: pendingSelection, color: 'red' }],
        });

        // Затем показываем правильный ответ зелёным (через 800мс)
        setTimeout(() => {
          set({
            highlightedCountries: [
              { country: pendingSelection, color: 'red' },
              { country: currentQuestion, color: 'green' },
            ],
          });

          // Перемещаем камеру на правильную страну (через 100мс после подсветки)
          setTimeout(() => {
            const event = new CustomEvent('focusOnCountry', {
              detail: { country: currentQuestion }
            });
            window.dispatchEvent(event);
          }, 100);
        }, 800);
      } else {
        // В обычном режиме показываем ошибку и продолжаем
        set({
          selectedCountry: pendingSelection,
          pendingSelection: null,
          isCorrect,
          phase: GamePhase.FEEDBACK,
          timerActive: false,
          highlightedCountries: [{ country: pendingSelection, color: 'red' }],
        });

        // Затем показываем правильный ответ зелёным (через 800мс)
        setTimeout(() => {
          set({
            highlightedCountries: [
              { country: pendingSelection, color: 'red' },
              { country: currentQuestion, color: 'green' },
            ],
          });

          // Перемещаем камеру на правильную страну (через 100мс после подсветки)
          setTimeout(() => {
            const event = new CustomEvent('focusOnCountry', {
              detail: { country: currentQuestion }
            });
            window.dispatchEvent(event);
          }, 100);
        }, 800);
      }
    }
  },

  cancelSelection: () => {
    // Отменяем выбор страны
    set({
      pendingSelection: null,
    });
  },

  updateTimer: (timeLeft) => set({ timeLeft }),

  stopTimer: () => set({ timerActive: false }),

  clearHighlightedCountries: () => set({ highlightedCountries: [] }),

  updateSettings: (newSettings) => set({ settings: { ...get().settings, ...newSettings } }),

  loadSavedStats: (stats) => set({ savedStats: stats }),
}));

/**
 * Расчёт очков с учётом серии и оставшегося времени
 */
function calculateScore(streak, timeLeft) {
  const baseScore = 100;
  const streakBonus = Math.min(streak, 5) * 20;
  const timeBonus = Math.floor(timeLeft * 1.5); // Баланс для 90 секунд
  return baseScore + streakBonus + timeBonus;
}

export default useGameStore;
