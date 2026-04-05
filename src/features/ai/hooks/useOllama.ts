import { useState, useEffect, useCallback } from 'react';

export interface OllamaModel {
  name: string;
  size: number;
  details: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export const useOllama = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [models, setModels]           = useState<OllamaModel[]>([]);
  const [loading, setLoading]         = useState(true);

  const checkOllama = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
    } catch {
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkOllama();
    const interval = setInterval(checkOllama, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [checkOllama]);

  return { isAvailable, models, loading, refresh: checkOllama };
};
