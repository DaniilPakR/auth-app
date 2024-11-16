import { useState, useCallback } from "react";

export function useError() {
  const [error, setError] = useState({ visible: false, message: "" });

  const showError = useCallback((message) => {
    setError({ visible: true, message });

    setTimeout(() => {
      setError({ visible: false, message: "" });
    }, 3000);
  }, []);

  return { error, showError };
}
