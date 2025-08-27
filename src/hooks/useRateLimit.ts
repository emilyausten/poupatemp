import { useState, useCallback } from 'react';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  storageKey: string;
}

interface RateLimitData {
  attempts: number;
  firstAttemptTime: number;
}

export const useRateLimit = ({ maxAttempts, windowMs, storageKey }: RateLimitOptions) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const stored = localStorage.getItem(storageKey);
    
    let rateLimitData: RateLimitData;
    
    if (stored) {
      rateLimitData = JSON.parse(stored);
      
      // Se o tempo da janela passou, resetar contador
      if (now - rateLimitData.firstAttemptTime > windowMs) {
        rateLimitData = {
          attempts: 1,
          firstAttemptTime: now
        };
      } else {
        rateLimitData.attempts += 1;
      }
    } else {
      rateLimitData = {
        attempts: 1,
        firstAttemptTime: now
      };
    }
    
    localStorage.setItem(storageKey, JSON.stringify(rateLimitData));
    
    if (rateLimitData.attempts > maxAttempts) {
      const timeLeft = windowMs - (now - rateLimitData.firstAttemptTime);
      setIsBlocked(true);
      setRemainingTime(Math.ceil(timeLeft / 1000 / 60)); // em minutos
      return false;
    }
    
    setIsBlocked(false);
    setRemainingTime(0);
    return true;
  }, [maxAttempts, windowMs, storageKey]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsBlocked(false);
    setRemainingTime(0);
  }, [storageKey]);

  return {
    checkRateLimit,
    reset,
    isBlocked,
    remainingTime
  };
};