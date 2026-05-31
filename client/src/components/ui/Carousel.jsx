import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function Carousel({ children }) {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  function updateScrollButtons() {
    const container = containerRef.current;
    if (!container) return;
    
    setShowLeft(container.scrollLeft > 5);
    setShowRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 5
    );
  }

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons, { passive: true });
      // Run once initially
      updateScrollButtons();
      
      // Also listen to window resize
      window.addEventListener("resize", updateScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollButtons);
      }
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [children]);

  function scroll(direction) {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  }

  return (
    <div className="group relative w-full">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex w-full gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth scrollbar-none"
      >
        {children}
      </div>

      {/* Left Slider Arrow Button */}
      {showLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-3.5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/5 bg-black/60 text-white backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl shadow-black/45"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Right Slider Arrow Button */}
      {showRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-3.5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/5 bg-black/60 text-white backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl shadow-black/45"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
