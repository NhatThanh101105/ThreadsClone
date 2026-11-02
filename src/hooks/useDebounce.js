import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any fast-changing value.
 * @param {any} value - The value to debounce.
 * @param {number} delay - Debounce delay in milliseconds (default 700ms).
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delay = 700) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
