// Risk badge component for displaying outbreak risk levels

import { getRiskLevel } from '../utils/predictions';

interface RiskBadgeProps {
  probability: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function RiskBadge({ probability, size = 'md', showText = true }: RiskBadgeProps) {
  const risk = getRiskLevel(probability);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const textColor = risk.level === 'medium' ? 'text-black' : 'text-white';

  return (
    <div
      className={`inline-block ${sizeClasses[size]} font-bold ${textColor}`}
      style={{ backgroundColor: risk.color }}
    >
      {showText ? risk.text : `${probability}%`}
    </div>
  );
}

interface RiskPercentageProps {
  probability: number;
  large?: boolean;
}

export function RiskPercentage({ probability, large = false }: RiskPercentageProps) {
  const risk = getRiskLevel(probability);
  
  return (
    <div className={`text-center ${large ? 'text-3xl' : 'text-xl'} font-bold`}>
      <div
        className={`inline-block px-4 py-2 ${large ? 'text-2xl' : ''}`}
        style={{ backgroundColor: risk.color, color: risk.level === 'medium' ? '#000' : '#fff' }}
      >
        {probability}%
      </div>
    </div>
  );
}
