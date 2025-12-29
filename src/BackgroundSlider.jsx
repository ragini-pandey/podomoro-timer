import { useState, useEffect } from 'react';
import './BackgroundSlider.css';
import { BACKGROUNDS } from './constants';

const BackgroundSlider = ({ selectedBackground }) => {
  const [currentIndex, setCurrentIndex] = useState(selectedBackground || { category: 'nature', index: 0 });

  const getAllBackgrounds = () => {
    const allBgs = [];
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
        if (typeof prevIndex === 'object') {
          const flatIndex = Object.keys(BACKGROUNDS).reduce((acc, cat, catIdx) => {
            if (cat === prevIndex.category) {
              return acc + prevIndex.index;
            }
            if (catIdx < Object.keys(BACKGROUNDS).indexOf(prevIndex.category)) {
              return acc + BACKGROUNDS[cat].length;
            }
            return acc;
          }, 0);
          
          const nextFlatIndex = (flatIndex + 1) % allBackgrounds.length;
          let count = 0;
          for (const [cat, bgs] of Object.entries(BACKGROUNDS)) {
            if (nextFlatIndex < count + bgs.length) {
              return { category: cat, index: nextFlatIndex - count };
            }
            count += bgs.length;
          }
        }
        return prevIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedBackground, allBackgrounds.length]);

  return (
    <div className="background-slider">
      {allBackgrounds.map((bg, index) => {
        const isActive = typeof currentIndex === 'object' 
          ? bg === BACKGROUNDS[currentIndex.category][currentIndex.index]
          : index === currentIndex;
        
        const wasPrevious = typeof currentIndex === 'object'
          ? (() => {
              const flatIndex = Object.keys(BACKGROUNDS).reduce((acc, cat, catIdx) => {
                if (cat === currentIndex.category) return acc + currentIndex.index;
                if (catIdx < Object.keys(BACKGROUNDS).indexOf(currentIndex.category)) {
                  return acc + BACKGROUNDS[cat].length;
                }
                return acc;
              }, 0);
              return index === (flatIndex - 1 + allBackgrounds.length) % allBackgrounds.length;
            })()
          : index === (currentIndex - 1 + allBackgrounds.length) % allBackgrounds.length;

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

