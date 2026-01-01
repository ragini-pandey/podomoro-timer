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

  useEffect(() => {
    if (selectedBackground !== undefined && selectedBackground !== null) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const flatIndex = Object.keys(BACKGROUNDS).reduce((acc, cat, catIdx) => {
          if (cat === prevIndex.category) {
            return acc + prevIndex.index;
          }
          if (catIdx < Object.keys(BACKGROUNDS).indexOf(prevIndex.category)) {
            return acc + BACKGROUNDS[cat as keyof typeof BACKGROUNDS].length;
          }
          return acc;
        }, 0);
        
        const nextFlatIndex = (flatIndex + 1) % allBackgrounds.length;
        let count = 0;
        for (const [cat, bgs] of Object.entries(BACKGROUNDS)) {
          if (nextFlatIndex < count + bgs.length) {
            return { category: cat as keyof typeof BACKGROUNDS, index: nextFlatIndex - count };
          }
          count += bgs.length;
        }
        return prevIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedBackground, allBackgrounds.length]);

  return (
    <div className="background-slider">
      {allBackgrounds.map((bg, index) => {
        const isActive = bg === BACKGROUNDS[currentIndex.category]?.[currentIndex.index];
        
        const flatIndex = Object.keys(BACKGROUNDS).reduce((acc, cat, catIdx) => {
          if (cat === currentIndex.category) return acc + currentIndex.index;
          if (catIdx < Object.keys(BACKGROUNDS).indexOf(currentIndex.category)) {
            return acc + BACKGROUNDS[cat as keyof typeof BACKGROUNDS].length;
          }
          return acc;
        }, 0);
        const wasPrevious = index === (flatIndex - 1 + allBackgrounds.length) % allBackgrounds.length;

        return (
          <div
            key={index}
            className={`background-slide ${isActive ? 'active' : ''} ${wasPrevious ? 'previous' : ''}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        );
      })}
      <div className="background-overlay" />
    </div>
  );
};

export default BackgroundSlider;

