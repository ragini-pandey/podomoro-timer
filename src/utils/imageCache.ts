import { BACKGROUNDS, BackgroundCategory } from '../constants';

interface CacheStatus {
  loaded: number;
  total: number;
  failed: string[];
}

class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  /**
   * Preload a single image and store it in cache
   */
  private async preloadImage(url: string): Promise<void> {
    if (this.cache.has(url)) {
      return Promise.resolve();
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(url, img);
        this.loadingPromises.delete(url);
        resolve();
      };

      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Start loading the image
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Preload all background images
   */
  async preloadAllBackgrounds(
    onProgress?: (status: CacheStatus) => void
  ): Promise<CacheStatus> {
    const allUrls: string[] = [];
    
    // Collect all image URLs
    Object.values(BACKGROUNDS).forEach(categoryImages => {
      allUrls.push(...categoryImages);
    });

    const status: CacheStatus = {
      loaded: 0,
      total: allUrls.length,
      failed: []
    };

    // Preload images with progress tracking
    const promises = allUrls.map(async (url) => {
      try {
        await this.preloadImage(url);
        status.loaded++;
        onProgress?.(status);
      } catch (error) {
        status.failed.push(url);
        status.loaded++;
        console.error(`Failed to cache image: ${url}`, error);
        onProgress?.(status);
      }
    });

    await Promise.all(promises);
    return status;
  }

  /**
   * Preload images for a specific category
   */
  async preloadCategory(
    category: BackgroundCategory,
    onProgress?: (status: CacheStatus) => void
  ): Promise<CacheStatus> {
    const urls = BACKGROUNDS[category] || [];
    
    const status: CacheStatus = {
      loaded: 0,
      total: urls.length,
      failed: []
    };

    const promises = urls.map(async (url) => {
      try {
        await this.preloadImage(url);
        status.loaded++;
        onProgress?.(status);
      } catch (error) {
        status.failed.push(url);
        status.loaded++;
        console.error(`Failed to cache image: ${url}`, error);
        onProgress?.(status);
      }
    });

    await Promise.all(promises);
    return status;
  }

  /**
   * Check if an image is cached
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size
    };
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

// Export a singleton instance
export const imageCache = new ImageCache();
