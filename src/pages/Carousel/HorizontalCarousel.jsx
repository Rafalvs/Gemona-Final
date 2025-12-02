import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HorizontalCarousel({ 
  children, 
  itemsPerView = 5, 
  itemWidth = 280,
  gap = 16,
  showControls = true,
  controlsColor = 'primary',
  className = ''
}) {
  const scrollRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Atualizar currentIndex baseado no scroll atual
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const itemFullWidth = itemWidth + gap
      const newIndex = Math.round(scrollLeft / itemFullWidth)
      setCurrentIndex(newIndex)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [itemWidth, gap])

  const scroll = (direction) => {
    const container = scrollRef.current
    if (container) {
      // Calcular scroll baseado na largura real do container
      const containerWidth = container.clientWidth
      const scrollAmount = containerWidth * 0.8 // 80% da largura do container
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        setCurrentIndex(Math.max(0, currentIndex - itemsPerView))
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        setCurrentIndex(Math.min(children.length - itemsPerView, currentIndex + itemsPerView))
      }
    }
  }

  const canScrollLeft = currentIndex > 0
  const canScrollRight = children.length > itemsPerView && currentIndex < children.length - itemsPerView

  return (
    <div className={`relative ${className}`}>
      {/* Botões de navegação posicionados nas laterais */}
      {showControls && children.length > itemsPerView && (
        <>
          {/* Botão Esquerdo */}
          <Button
            isIconOnly
            size="lg"
            variant="shadow"
            color="primary"
            onClick={() => scroll('left')}
            isDisabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-xl border-2 transition-all duration-300 ${
              controlsColor === 'primary' 
                ? "bg-white/90 hover:bg-white border-[#05315e]/20 hover:border-[#05315e]/40 hover:shadow-2xl backdrop-blur-sm" 
                : "bg-[#05315e]/90 hover:bg-[#05315e] border-[#ffecd1]/20 hover:border-[#ffecd1]/40 hover:shadow-2xl backdrop-blur-sm"
            } ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <ChevronLeft 
              size={20} 
              className={controlsColor === 'primary' ? "text-[#05315e]" : "text-[#ffecd1]"} 
            />
          </Button>

          {/* Botão Direito */}
          <Button
            isIconOnly
            size="lg"
            variant="shadow"
            color="primary"
            onClick={() => scroll('right')}
            isDisabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-xl border-2 transition-all duration-300 ${
              controlsColor === 'primary' 
                ? "bg-white/90 hover:bg-white border-[#05315e]/20 hover:border-[#05315e]/40 hover:shadow-2xl backdrop-blur-sm" 
                : "bg-[#05315e]/90 hover:bg-[#05315e] border-[#ffecd1]/20 hover:border-[#ffecd1]/40 hover:shadow-2xl backdrop-blur-sm"
            } ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <ChevronRight 
              size={20} 
              className={controlsColor === 'primary' ? "text-[#05315e]" : "text-[#ffecd1]"} 
            />
          </Button>
        </>
      )}
      
      <div 
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide scroll-smooth pb-2 carousel-container ${
          showControls && children.length > itemsPerView ? 'px-12' : ''
        }`}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          gap: `${gap}px`,
          width: '100%'
        }}
      >
        {children.map((child, index) => (
          <div 
            key={index}
            className="flex-shrink-0 carousel-item"
            style={{ 
              minWidth: `${itemWidth}px`,
              maxWidth: `${itemWidth}px`,
              width: `${itemWidth}px`
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Indicadores melhorados */}
      {showControls && children.length > itemsPerView && (
        <div className="flex justify-center mt-6 gap-3">
          {Array.from({ length: Math.ceil(children.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 rounded-full border-2 hover:scale-125 ${
                Math.floor(currentIndex / itemsPerView) === index
                  ? controlsColor === 'primary'
                    ? 'w-8 h-3 bg-[#05315e] border-[#05315e] shadow-lg'
                    : 'w-8 h-3 bg-[#ffecd1] border-[#ffecd1] shadow-lg'
                  : controlsColor === 'primary'
                    ? 'w-3 h-3 bg-[#05315e]/20 border-[#05315e]/30 hover:bg-[#05315e]/40 hover:border-[#05315e]/50'
                    : 'w-3 h-3 bg-[#ffecd1]/20 border-[#ffecd1]/30 hover:bg-[#ffecd1]/40 hover:border-[#ffecd1]/50'
              }`}
              onClick={() => {
                const targetIndex = index * itemsPerView
                const container = scrollRef.current
                if (container) {
                  const scrollAmount = (itemWidth + gap) * targetIndex
                  container.scrollTo({ left: scrollAmount, behavior: 'smooth' })
                  setCurrentIndex(targetIndex)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Hook para usar com o carrossel
export function useCarousel(totalItems, itemsPerView = 5) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < totalItems - itemsPerView
  
  const scrollTo = (direction, scrollRef, itemWidth, gap) => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = (itemWidth + gap) * itemsPerView
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        setCurrentIndex(Math.max(0, currentIndex - itemsPerView))
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        setCurrentIndex(Math.min(totalItems - itemsPerView, currentIndex + itemsPerView))
      }
    }
  }
  
  return {
    currentIndex,
    canScrollLeft,
    canScrollRight,
    scrollTo,
    setCurrentIndex
  }
}