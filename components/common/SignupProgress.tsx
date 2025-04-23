'use client';

import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

export default function SignupProgress() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/stats/count');
        const data = await response.json();
        console.log("client received count", data);
        setCount(data.count);
      } catch (error) {
        console.error('Error fetching signup count:', error);
      }
    };

    // Fetch immediately
    fetchCount();

    // Then fetch every 10 seconds
    const interval = setInterval(fetchCount, 10000);

    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  const progress = Math.min((count / 5000) * 100, 100);

  return (
    <div className="bg-sand/60 border border-sand p-4 rounded-md backdrop-blur-md text-dark-brown mb-4">
      <h2>Shipwrecked unlocks at 5,000 signups!</h2>
      <p className="text-sm sm:text-base mb-2">
        <span className="font-bold">{count}</span> people have signed up so far!
      </p>
      <ProgressBar 
        value={progress} 
        max={100}
        variant="success"
        height={6}
        animated
        label={`${Math.round(progress)}% to 5000`}
      />
    </div>
  );
} 