/**
 * Вычисляет центроид геометрии страны с учётом особенностей:
 * - Страны, пересекающие 180-й меридиан (Россия, Фиджи и др.)
 * - Страны с заморскими территориями (Франция, США и др.)
 * - Страны с несколькими островами
 *
 * @param {Object} country - GeoJSON Feature страны
 * @returns {{lat: number, lng: number}} Координаты центроида
 */
export function calculateCountryCentroid(country) {
  const geometry = country.geometry;
  const properties = country.properties;
  const bbox = country.bbox;

  if (!geometry || !geometry.coordinates) {
    return { lat: 0, lng: 0 };
  }

  // Специальные случаи для стран с проблемными bbox
  // Используем общепринятые географические центры
  
  // Россия - пересекает 180-й меридиан
  if (properties.ISO_A2 === 'RU') {
    return { lat: 61.524, lng: 105.3188 };
  }

  // Франция - включает заморские территории
  if (properties.ISO_A2 === 'FR') {
    return { lat: 46.2276, lng: 2.2137 };
  }

  // США - включают Аляску и Гавайи
  if (properties.ISO_A2 === 'US') {
    return { lat: 39.8283, lng: -98.5795 };
  }

  // Дания - включает Гренландию и Фарерские острова
  if (properties.ISO_A2 === 'DK') {
    return { lat: 56.2639, lng: 9.5018 };
  }

  // Норвегия - включает Шпицберген и Ян-Майен
  if (properties.ISO_A2 === 'NO') {
    return { lat: 60.472, lng: 8.4689 };
  }

  // Новая Зеландия - состоит из двух основных островов
  if (properties.ISO_A2 === 'NZ') {
    return { lat: -40.9006, lng: 174.886 };
  }

  // Япония - архипелаг
  if (properties.ISO_A2 === 'JP') {
    return { lat: 36.2048, lng: 138.2529 };
  }

  // Филиппины - архипелаг
  if (properties.ISO_A2 === 'PH') {
    return { lat: 12.8797, lng: 121.774 };
  }

  // Индонезия - архипелаг, пересекающий экватор
  if (properties.ISO_A2 === 'ID') {
    return { lat: -0.7893, lng: 113.9213 };
  }

  // Чили - очень вытянутая страна
  if (properties.ISO_A2 === 'CL') {
    return { lat: -35.6751, lng: -71.543 };
  }

  // Для стран, пересекающих 180-й меридиан (Фиджи и др.)
  if (bbox && bbox[0] === -180 && bbox[2] === 180) {
    return calculateCentroidFromGeometry(geometry);
  }

  // Для стран с несколькими полигонами (острова)
  if (geometry.type === 'MultiPolygon') {
    return calculateCentroidFromMultiPolygon(geometry.coordinates);
  }

  // Для обычных полигонов
  if (geometry.type === 'Polygon') {
    return calculateCentroidFromPolygon(geometry.coordinates);
  }

  // Fallback: используем центр bbox
  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  }

  return { lat: 0, lng: 0 };
}

/**
 * Вычисляет центроид из MultiPolygon геометрии
 * Находит наибольший полигон (основную территорию)
 */
function calculateCentroidFromMultiPolygon(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  // Находим наибольший полигон по площади
  let largestPolygon = null;
  let maxArea = 0;

  for (const polygon of coordinates) {
    // Берём внешний контур (первый элемент)
    const exteriorRing = polygon[0];
    if (!exteriorRing) continue;

    const area = calculatePolygonArea(exteriorRing);
    if (area > maxArea) {
      maxArea = area;
      largestPolygon = exteriorRing;
    }
  }

  if (largestPolygon) {
    return calculateCentroidFromRing(largestPolygon);
  }

  return { lat: 0, lng: 0 };
}

/**
 * Вычисляет центроид из Polygon геометрии
 */
function calculateCentroidFromPolygon(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  // Берём внешний контур (первый элемент)
  const exteriorRing = coordinates[0];
  if (!exteriorRing) {
    return { lat: 0, lng: 0 };
  }

  return calculateCentroidFromRing(exteriorRing);
}

/**
 * Вычисляет центроид из геометрии (универсальный метод)
 */
function calculateCentroidFromGeometry(geometry) {
  if (geometry.type === 'MultiPolygon') {
    return calculateCentroidFromMultiPolygon(geometry.coordinates);
  }
  if (geometry.type === 'Polygon') {
    return calculateCentroidFromPolygon(geometry.coordinates);
  }
  return { lat: 0, lng: 0 };
}

/**
 * Вычисляет центроид кольца полигона
 */
function calculateCentroidFromRing(ring) {
  if (!ring || ring.length === 0) {
    return { lat: 0, lng: 0 };
  }

  // Вычисляем площадь и центроид используя формулу шулейкина
  let area = 0;
  let cx = 0;
  let cy = 0;

  const n = ring.length;
  for (let i = 0; i < n - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];

    // Преобразуем в радианы для более точных вычислений
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lng1Rad = (lng1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lng2Rad = (lng2 * Math.PI) / 180;

    const cross = lat1Rad * lng2Rad - lat2Rad * lng1Rad;
    area += cross;
    cx += (lat1Rad + lat2Rad) * cross;
    cy += (lng1Rad + lng2Rad) * cross;
  }

  area /= 2;

  if (Math.abs(area) < 1e-10) {
    // Если площадь слишком мала, используем простой центр масс
    let sumLat = 0;
    let sumLng = 0;
    let count = 0;

    ring.forEach(([lng, lat]) => {
      sumLat += lat;
      sumLng += lng;
      count++;
    });

    return {
      lat: sumLat / count,
      lng: sumLng / count,
    };
  }

  cx /= (6 * area);
  cy /= (6 * area);

  // Преобразуем обратно в градусы
  const centroidLat = (cx * 180) / Math.PI;
  const centroidLng = (cy * 180) / Math.PI;

  return { lat: centroidLat, lng: centroidLng };
}

/**
 * Вычисляет приблизительную площадь полигона (для сравнения)
 */
function calculatePolygonArea(ring) {
  if (!ring || ring.length < 3) return 0;

  let area = 0;
  const n = ring.length;

  for (let i = 0; i < n - 1; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    area += lat1 * lng2 - lat2 * lng1;
  }

  return Math.abs(area / 2);
}

/**
 * Получает отображаемое название страны
 */
export function getCountryDisplayName(country) {
  const props = country.properties;
  // Используем NAME для краткого названия
  return props.NAME || props.NAME_SORT || props.ADMIN || 'Unknown';
}
