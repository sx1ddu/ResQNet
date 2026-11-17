const TILE_SIZE_DEG_FACTOR = Math.PI / 180;

function lngToTileX(lng, zoom) {
  return Math.floor(((lng + 180) / 360) * 2 ** zoom);
}

function latToTileY(lat, zoom) {
  const latRad = lat * TILE_SIZE_DEG_FACTOR;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom
  );
}

function kmToDegrees(km, lat) {
  const latDegrees = km / 111;
  const lngDegrees = km / (111 * Math.cos((lat * Math.PI) / 180));
  return { latDegrees, lngDegrees };
}

export function computeTileUrls({ lat, lng, radiusKm, minZoom = 12, maxZoom = 15 }) {
  const urls = [];
  const { latDegrees, lngDegrees } = kmToDegrees(radiusKm, lat);

  const bounds = {
    north: lat + latDegrees,
    south: lat - latDegrees,
    east: lng + lngDegrees,
    west: lng - lngDegrees,
  };

  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = lngToTileX(bounds.west, z);
    const xMax = lngToTileX(bounds.east, z);
    const yMin = latToTileY(bounds.north, z);
    const yMax = latToTileY(bounds.south, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const subdomain = ['a', 'b', 'c'][(x + y) % 3];
        urls.push(`https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
  }

  return urls;
}

export async function downloadTilesForOfflineUse({ lat, lng, radiusKm }, onProgress) {
  if (!('caches' in window)) {
    throw new Error('This browser does not support offline caching.');
  }

  const urls = computeTileUrls({ lat, lng, radiusKm });
  const cache = await caches.open('resqnet-map-tiles-v1');

  const BATCH_SIZE = 8;
  let completed = 0;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (url) => {
        try {
          const response = await fetch(url, { mode: 'no-cors' });
          await cache.put(url, response);
        } catch {
          // Skip momentary tile error
        }
        completed += 1;
        onProgress?.(completed, urls.length);
      })
    );
  }

  return { tilesDownloaded: completed, totalTiles: urls.length };
}

export async function registerMapServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (err) {
    console.warn('[offlineMap] Service worker registration failed:', err.message);
    return null;
  }
}
