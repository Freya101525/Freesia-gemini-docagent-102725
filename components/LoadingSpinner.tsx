
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
      <p className="mt-4 text-white text-lg font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
