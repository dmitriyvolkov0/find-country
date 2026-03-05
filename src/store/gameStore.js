import { create } from 'zustand';

/**
 * Состояния игры
 */
export const GamePhase = {
  START: 'start',
  QUESTION: 'question',
  FEEDBACK: 'feedback',
  GAME_OVER: 'game_over',
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
  timeLeft: 30,
  timerActive: false,

  // Выбранная страна
  selectedCountry: null,
  isCorrect: null,

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
      timeLeft: 30,
      timerActive: true,
      selectedCountry: null,
      isCorrect: null,
      countriesData: selected,
      usedCountries: [selected[0]],
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
      timeLeft: 30,
      timerActive: true,
      selectedCountry: null,
      isCorrect: null,
      usedCountries: [...usedCountries, nextCountry],
    });
  },

  selectCountry: (country) => {
    const { currentQuestion } = get();
    const isCorrect = country?.properties?.ISO_A3 === currentQuestion?.properties?.ISO_A3;

    set({
      selectedCountry: country,
      isCorrect,
      phase: GamePhase.FEEDBACK,
      timerActive: false,
      score: isCorrect ? get().score + calculateScore(get().streak, get().timeLeft) : get().score,
      correctAnswers: isCorrect ? get().correctAnswers + 1 : get().correctAnswers,
      streak: isCorrect ? get().streak + 1 : 0,
      maxStreak: isCorrect ? Math.max(get().maxStreak, get().streak + 1) : get().maxStreak,
    });
  },

  updateTimer: (timeLeft) => set({ timeLeft }),

  stopTimer: () => set({ timerActive: false }),

  updateSettings: (newSettings) => set({ settings: { ...get().settings, ...newSettings } }),

  loadSavedStats: (stats) => set({ savedStats: stats }),
}));

/**
 * Расчёт очков с учётом серии и оставшегося времени
 */
function calculateScore(streak, timeLeft) {
  const baseScore = 100;
  const streakBonus = Math.min(streak, 5) * 20;
  const timeBonus = timeLeft * 5;
  return baseScore + streakBonus + timeBonus;
}

export default useGameStore;
