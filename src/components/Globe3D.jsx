import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  } = useGameStore();

  const [countries, setCountries] = useState({ features: [] });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const globeRef = useRef(null);

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
      } catch (err) {
        console.error('Error loading countries data:', err);
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
  }, [phase, onCountryClick]);

  /**
   * Обработка наведения на страну
   */
  const handlePolygonHover = useCallback((country) => {
    setHoveredCountry(country);
    if (country && phase === GamePhase.QUESTION) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [phase]);

  /**
   * Определение цвета страны
   */
  const getCountryColor = useCallback((country) => {
    if (!currentQuestion) return '#4a5568';

    const isSelected = selectedCountry?.properties?.ISO_A3 === country.properties?.ISO_A3;
    const isTarget = currentQuestion.properties?.ISO_A3 === country.properties?.ISO_A3;

    // Проверяем массив подсветки
    if (highlightedCountries && highlightedCountries.length > 0) {
      const highlighted = highlightedCountries.find(
        h => h.country?.properties?.ISO_A3 === country.properties?.ISO_A3
      );
      if (highlighted) {
        return highlighted.color === 'red' ? '#ef4444' : '#22c55e';
      }
    }

    if (phase === GamePhase.FEEDBACK) {
      if (isSelected) {
        return selectedCountry === currentQuestion ? '#48bb78' : '#f56565';
      }
      if (isTarget && selectedCountry !== currentQuestion) {
        return '#48bb78';
      }
    }

    // Подсветка при наведении
    if (hoveredCountry?.properties?.ISO_A3 === country.properties?.ISO_A3) {
      return '#60a5fa';
    }

    return '#4a5568';
  }, [currentQuestion, selectedCountry, phase, hoveredCountry, highlightedCountries]);

  /**
   * Определение высоты страны
   */
  const getCountryAltitude = useCallback((country) => {
    // Убираем подсветку высоты во время обратной связи
    if (phase === GamePhase.FEEDBACK) {
      return 0.06;
    }
    if (hoveredCountry?.properties?.ISO_A3 === country.properties?.ISO_A3) {
      return 0.12;
    }
    return 0.06;
  }, [hoveredCountry, phase]);

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
        label={{
          text: (d) => d.properties?.NAME || '',
          resolution: 6,
        }}
      />
    </div>
  );
}

export default Globe3D;
