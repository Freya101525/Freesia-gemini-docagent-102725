
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step} className="md:flex-1">
            {index <= currentStep ? (
              <a
                href="#"
                className="group flex flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors hover:border-sky-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span className="text-sm font-medium text-sky-600 transition-colors group-hover:text-sky-800">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium">{step}</span>
              </a>
            ) : (
              <a
                href="#"
                className="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span className="text-sm font-medium text-gray-500 transition-colors group-hover:text-gray-700">{`Step ${index + 1}`}</span>
                <span className="text-sm font-medium">{step}</span>
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;
