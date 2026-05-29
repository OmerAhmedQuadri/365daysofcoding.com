import { useState, useEffect } from 'react';
import { getMyBootcamp } from '../api/bootcamps.js';

export default function useBootcamp() {
  const [bootcamp, setBootcamp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBootcamp()
      .then(setBootcamp)
      .catch(() => setBootcamp(null))
      .finally(() => setLoading(false));
  }, []);

  return { bootcamp, loading };
}
