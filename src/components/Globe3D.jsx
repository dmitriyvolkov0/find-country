import React, { useState, useEffect, useCallback } from 'react';
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
  } = useGameStore();

  const [countries, setCountries] = useState({ features: [] });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [globeKey, setGlobeKey] = useState(0);

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
  }, [currentQuestion, selectedCountry, phase, hoveredCountry]);

  /**
   * Определение высоты страны
   */
  const getCountryAltitude = useCallback((country) => {
    if (hoveredCountry?.properties?.ISO_A3 === country.properties?.ISO_A3) {
      return 0.12;
    }
    return 0.06;
  }, [hoveredCountry]);

  // Перерисовка глобуса при изменении состояния
  useEffect(() => {
    setGlobeKey(prev => prev + 1);
  }, [currentQuestion, selectedCountry, phase]);

  return (
    <div className="w-full h-full" style={{ touchAction: 'none' }}>
      <Globe
        key={globeKey}
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
        
        polygonsTransitionDuration={300}
        label={{
          text: (d) => d.properties?.NAME || '',
          resolution: 6,
        }}
      />
    </div>
  );
}

export default Globe3D;
