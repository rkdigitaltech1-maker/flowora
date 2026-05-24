import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  triggerImmediately?: boolean;
  className?: string;
}

export function CountUp({
  end,
  duration = 1200,
  suffix = "",
  prefix = "",
  decimals = 0,
  triggerImmediately = false,
  className = "",
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(triggerImmediately);
  const ref = useRef<HTMLSpanElement>(null);
  const prevEndRef = useRef(0);

  useEffect(() => {
    if (triggerImmediately) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerImmediately]);

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number | null = null;
    const startValue = prevEndRef.current;
    const diff = end - startValue;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(startValue + progress * diff);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        prevEndRef.current = end;
      }
    };
    
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
