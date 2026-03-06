import { create } from 'zustand';

/**
 * Состояния игры
 */
export const GamePhase = {
  START: 'start',
  QUESTION: 'question',
  FEEDBACK: 'feedback',
  GAME_OVER: 'game_over',
  VIEW: 'view', // Режим просмотра
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

  startGame: async (countriesData) => {
    // Если данные не переданы, загружаем их
    let dataToUse = countriesData;
    if (!dataToUse || dataToUse.length === 0) {
      dataToUse = await loadCountriesData();
    }

    if (dataToUse.length === 0) {
      console.error('No countries data available');
      return;
    }

    const shuffled = [...dataToUse].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, get().totalQuestions);

    set({
      phase: GamePhase.QUESTION,
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
      currentQuestion: null,
      selectedCountry: null,
      pendingSelection: null,
    });
  },

  nextQuestion: () => {
    const { questionIndex, countriesData, usedCountries } = get();
    const nextIndex = questionIndex + 1;

    if (nextIndex >= countriesData.length) {
      set({ phase: GamePhase.GAME_OVER, timerActive: false });
      return;
    }

    // Выбираем следующую страну, которую ещё не использовали
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
    const { pendingSelection, currentQuestion, streak } = get();
    if (!pendingSelection) return;

    const isCorrect = pendingSelection?.properties?.ISO_A3 === currentQuestion?.properties?.ISO_A3;

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
      // Ошибочный ответ — сначала показываем ошибку красным
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
