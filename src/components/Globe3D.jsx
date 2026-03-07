import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import useGameStore, { GamePhase } from '../store/gameStore';

/**
 * Компонент 3D глобуса с интерактивными странами
 */
export function Globe3D({ onCountryClick }) {
  const {
    currentQuestion,
    selectedCountry,
    phase,
    highlightedCountries,
    pendingSelection,
    hintZone, // Зона подсказки { lat, lng }
  } = useGameStore();

  const [countries, setCountries] = useState({ features: [] });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countryLabels, setCountryLabels] = useState([]);
  const [showHintMarker, setShowHintMarker] = useState(false); // Показывать ли маркер
  const [hintCoords, setHintCoords] = useState({ lat: 0, lng: 0 }); // Координаты маркера
  const globeRef = useRef(null);

  /**
   * Проверка на мобильное устройство
   */
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia('(pointer: coarse)').matches);
  }, []);

  /**
   * Загрузка данных о странах
   */
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('./src/datasets/ne_110m_admin_0_countries.geojson');
        const data = await response.json();

        // Фильтруем страны
        const features = data.features.filter(country => {
          const props = country.properties;
          return (
            props.CONTINENT !== 'Antarctica' &&
            props.POP_EST > 10000 &&
            (props.TYPE === 'Sovereign country' || props.TYPE === 'Country') &&
            props.NAME !== 'Antarctica'
          );
        });

        setCountries({ features });

        // Создаём данные для лейблов с координатами
        const labels = features.map(country => {
          const props = country.properties;
          let lat, lng;

          // Используем центр bounding box: [minX, minY, maxX, maxY]
          if (country.bbox) {
            const [minX, minY, maxX, maxY] = country.bbox;
            lat = (minY + maxY) / 2;
            lng = (minX + maxX) / 2;
          } else {
            lat = 0;
            lng = 0;
          }

          return {
            lat,
            lng,
            name: props.NAME || '',
            iso: props.ADM0_A3 || '',
          };
        });

        setCountryLabels(labels);
      } catch (err) {
        
      }
    };

    loadCountries();
  }, []);

  /**
   * Обработка клика по стране
   */
  const handlePolygonClick = useCallback((country) => {
    if (phase === GamePhase.QUESTION && onCountryClick) {
      onCountryClick(country);
    }
    // В режиме VIEW клики не обрабатываем
  }, [phase, onCountryClick]);

  /**
   * Обработка наведения на страну
   */
  const handlePolygonHover = useCallback((country) => {
    // На мобильных устройствах отключаем hover-эффекты
    if (isMobile) {
      setHoveredCountry(null);
      document.body.style.cursor = 'default';
      return;
    }
    
    setHoveredCountry(country);
    if (country && (phase === GamePhase.QUESTION || phase === GamePhase.VIEW)) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [phase, isMobile]);

  /**
   * Определение цвета страны
   */
  const getCountryColor = useCallback((country) => {
    if (!currentQuestion) return '#4a5568';

    const isSelected = selectedCountry?.properties?.ADM0_A3 === country.properties?.ADM0_A3;
    const isTarget = currentQuestion.properties?.ADM0_A3 === country.properties?.ADM0_A3;
    const isPending = pendingSelection?.properties?.ADM0_A3 === country.properties?.ADM0_A3;

    // Проверяем зону подсказки (жёлтый цвет для региона)
    if (hintZone?.countries && hintZone.countries.length > 0) {
      const hinted = hintZone.countries.find(
        h => h.country?.properties?.ADM0_A3 === country.properties?.ADM0_A3
      );
      if (hinted) {
        return '#eab308'; // Жёлтый цвет для подсказки
      }
    }

    // Проверяем массив подсветки
    if (highlightedCountries && highlightedCountries.length > 0) {
      const highlighted = highlightedCountries.find(
        h => h.country?.properties?.ADM0_A3 === country.properties?.ADM0_A3
      );
      if (highlighted) {
        return highlighted.color === 'red' ? '#ef4444' : '#22c55e';
      }
    }

    // Подсветка страны, ожидающей подтверждения (синий/голубой)
    if (isPending && phase === GamePhase.QUESTION) {
      return '#60a5fa';
    }

    if (phase === GamePhase.FEEDBACK) {
      if (isSelected) {
        return selectedCountry === currentQuestion ? '#48bb78' : '#f56565';
      }
      if (isTarget && selectedCountry !== currentQuestion) {
        return '#48bb78';
      }
    }

    // Подсветка при наведении (только на десктопе)
    if (!isMobile && hoveredCountry?.properties?.ADM0_A3 === country.properties?.ADM0_A3) {
      return '#60a5fa';
    }

    return '#4a5568';
  }, [currentQuestion, selectedCountry, phase, hoveredCountry, highlightedCountries, pendingSelection, hintZone, isMobile]);

  /**
   * Определение высоты страны
   */
  const getCountryAltitude = useCallback((country) => {
    // Убираем подсветку высоты во время обратной связи
    if (phase === GamePhase.FEEDBACK) {
      return 0.06;
    }
    // Подсветка высоты при наведении (только на десктопе)
    if (!isMobile && hoveredCountry?.properties?.ADM0_A3 === country.properties?.ADM0_A3) {
      return 0.12;
    }
    return 0.06;
  }, [hoveredCountry, phase, isMobile]);

  /**
   * Фокусировка камеры на стране
   */
  const focusOnCountry = useCallback((country) => {
    if (!globeRef.current || !country) return;

    // Получаем координаты центра страны
    let lat, lng;
    
    // Пробуем использовать LABEL_Y/LABEL_X если есть
    if (country.properties?.LABEL_Y && country.properties?.LABEL_X) {
      lat = country.properties.LABEL_Y;
      lng = country.properties.LABEL_X;
    } else if (country.bbox) {
      // Используем центр bounding box: [minX, minY, maxX, maxY]
      const [minX, minY, maxX, maxY] = country.bbox;
      lat = (minY + maxY) / 2;
      lng = (minX + maxX) / 2;
    } else {
      // Fallback: вычисляем центр из геометрии
      const coords = country.geometry?.coordinates;
      if (coords && coords.length > 0) {
        let sumLat = 0, sumLng = 0, count = 0;
        const flattenCoords = Array.isArray(coords[0][0]) ? coords[0] : coords;
        flattenCoords.forEach(ring => {
          ring.forEach(([cLng, cLat]) => {
            sumLat += cLat;
            sumLng += cLng;
            count++;
          });
        });
        lat = sumLat / count;
        lng = sumLng / count;
      } else {
        lat = 0;
        lng = 0;
      }
    }

    // Плавный переход камеры
    globeRef.current.pointOfView({
      lat,
      lng,
      altitude: 1.5,
    }, 1500); // 1.5 секунды на анимацию
  }, []);

  /**
   * Обработчик события фокусировки
   */
  useEffect(() => {
    const handleFocusEvent = (e) => {
      focusOnCountry(e.detail.country);
    };

    window.addEventListener('focusOnCountry', handleFocusEvent);

    return () => {
      window.removeEventListener('focusOnCountry', handleFocusEvent);
    };
  }, [focusOnCountry]);

  /**
   * Обработчик события фокусировки на регионе подсказки
   */
  useEffect(() => {
    const handleHintFocusEvent = (e) => {
      const { lat, lng } = e.detail;
      if (lat !== undefined && lng !== undefined && globeRef.current) {
        // Поворот к координатам подсказки
        globeRef.current.pointOfView({
          lat,
          lng,
          altitude: 1.5,
        }, 1500);
      }
    };

    window.addEventListener('focusOnHintRegion', handleHintFocusEvent);

    return () => {
      window.removeEventListener('focusOnHintRegion', handleHintFocusEvent);
    };
  }, []);

  /**
   * Обновление маркера подсказки при изменении hintZone (простое появление/исчезновение)
   */
  useEffect(() => {
    let hideTimeout;

    // Если появилась подсказка, планируем её исчезновение через 4 секунды
    if (hintZone?.lat !== undefined) {
      // Сразу показываем маркер
      setHintCoords({ lat: hintZone.lat, lng: hintZone.lng });
      setShowHintMarker(true);
      
      // Автоматическое скрытие через 4 секунды
      hideTimeout = setTimeout(() => {
        // Скрываем маркер
        setShowHintMarker(false);
        // Очищаем hintZone после скрытия
        useGameStore.getState().clearHintZone();
      }, 4000); // 4 секунды
    } else {
      // Если hintZone очищен, просто скрываем маркер
      setShowHintMarker(false);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hintZone]);

  return (
    <div className="w-full h-full" style={{ touchAction: 'none' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="#3a22c0"
        atmosphereAltitude={0.25}

        polygonsData={countries.features}
        polygonAltitude={getCountryAltitude}
        polygonCapColor={getCountryColor}
        polygonSideColor={() => '#2d3748'}
        polygonStrokeColor={() => '#1a202c'}

        onPolygonHover={handlePolygonHover}
        onPolygonClick={handlePolygonClick}

        polygonsTransitionDuration={700}

        // HTML элементы: названия стран (только в режиме просмотра)
        htmlElementsData={phase === GamePhase.VIEW ? countryLabels : []}
        htmlElement={(elem) => {
          const div = document.createElement('div');
          div.className = 'text-white text-xs font-semibold pointer-events-none';
          div.style.cssText = `
            background: rgba(0, 0, 0, 0.6);
            padding: 2px 6px;
            border-radius: 4px;
            white-space: nowrap;
            font-size: 11px;
            text-shadow: 1px 1px 2px black;
          `;
          div.textContent = elem.name;
          return div;
        }}

        // Маркеры подсказки (жёлтые круги, наносимые на карту поверх стран)
        pointsData={showHintMarker ? [{ lat: hintCoords.lat, lng: hintCoords.lng }] : []}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointColor={() => 'rgba(234, 179, 8, 0.5)'}
        pointRadius={20} // Большой радиус
        pointResolution={32} // Гладкий круг
        pointOpacity={0.5} // Фиксированная прозрачность
        pointElevation={0}
        onPointClick={() => {}} // Игнорируем клики
      />
    </div>
  );
}

export default Globe3D;
