import { BACKGROUNDS } from '../constants';

/**
 * Register service worker for offline caching
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available, please refresh.');
            }
          });
        }
      });

      // Send background URLs to service worker for caching
      if (registration.active) {
        sendBackgroundsToServiceWorker(registration);
      } else {
        // Wait for service worker to activate
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          sendBackgroundsToServiceWorker(registration);
        });
      }

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('Service Workers are not supported in this browser.');
    return null;
  }
}

/**
 * Send all background image URLs to service worker for caching
 */
function sendBackgroundsToServiceWorker(registration: ServiceWorkerRegistration) {
  const allUrls: string[] = [];
  Object.values(BACKGROUNDS).forEach((categoryImages) => {
    allUrls.push(...categoryImages);
  });

  if (registration.active) {
    registration.active.postMessage({
      type: 'CACHE_BACKGROUNDS',
      urls: allUrls,
    });
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    return registration.unregister();
  }
  return false;
}
