import { useEffect, useState } from 'react';

// Seconds left on a countdown, e.g. before a code can be resent. Set it to start counting down.
export default function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return [secondsLeft, setSecondsLeft];
}
