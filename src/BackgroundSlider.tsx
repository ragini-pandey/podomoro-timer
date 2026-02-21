import { useState, useEffect } from 'react';
import './BackgroundSlider.css';
import { BACKGROUNDS, BackgroundSelection } from './constants';

interface BackgroundSliderProps {
  selectedBackground: BackgroundSelection | null;
}

const BackgroundSlider = ({ selectedBackground }: BackgroundSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState<BackgroundSelection>(selectedBackground || { category: 'nature', index: 0 });

  const getAllBackgrounds = (): string[] => {
    const allBgs: string[] = [];
    Object.values(BACKGROUNDS).forEach(categoryBgs => {
      allBgs.push(...categoryBgs);
    });
    return allBgs;
  };

  const allBackgrounds = getAllBackgrounds();

  useEffect(() => {
    if (selectedBackground !== undefined && selectedBackground !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(selectedBackground);
    }
  }, [selectedBackground]);

  // Calculate flat index for current position
  const flatIndex = Object.keys(BACKGROUNDS).reduce((acc, cat, catIdx) => {
    if (cat === currentIndex.category) return acc + currentIndex.index;
    if (catIdx < Object.keys(BACKGROUNDS).indexOf(currentIndex.category)) {
      return acc + BACKGROUNDS[cat as keyof typeof BACKGROUNDS].length;
    }
    return acc;
  }, 0);

  // Get current background URL
  const currentBackgroundUrl = allBackgrounds[flatIndex];

  // Preload all background images in the background after initial load
  useEffect(() => {
    const preloadImages = () => {
      const imagesToPreload = allBackgrounds.filter(url => url !== currentBackgroundUrl);
      
      let currentIndex = 0;
      
      const loadNextBatch = () => {
        // Load 3 images at a time
        const batchSize = 3;
        const batch = imagesToPreload.slice(currentIndex, currentIndex + batchSize);
        
        batch.forEach(url => {
          const img = new Image();
          img.src = url;
        });
        
        currentIndex += batchSize;
        
        // If there are more images, schedule the next batch
        if (currentIndex < imagesToPreload.length) {
          setTimeout(loadNextBatch, 200);
        } else {
          console.log('All background images preloaded');
        }
      };
      
      // Start preloading immediately after a brief delay
      setTimeout(loadNextBatch, 2000);
    };
    
    preloadImages();
  }, [allBackgrounds, currentBackgroundUrl]);

  return (
    <div className="background-slider">
      <div
        className="background-slide active"
        style={{ backgroundImage: `url(${currentBackgroundUrl})` }}
      />
      <div className="background-overlay" />
    </div>
  );
};

export default BackgroundSlider;

