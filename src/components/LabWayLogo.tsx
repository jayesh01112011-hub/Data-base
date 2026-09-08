import React from 'react';

interface LabWayLogoProps {
  className?: string;
  dotSize?: number;
  showText?: boolean;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LabWayLogo: React.FC<LabWayLogoProps> = ({
  className = '',
  showText = true,
  textClassName = '',
  size = 'md'
}) => {
  const dimensions = {
    sm: { box: 18, dotR: 1.6, text: 'text-sm' },
    md: { box: 22, dotR: 2.0, text: 'text-base' },
    lg: { box: 30, dotR: 2.7, text: 'text-xl' }
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3x3 Dot Matrix Mark */}
      <svg
        width={dimensions.box}
        height={dimensions.box}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="LabWay Logo"
      >
        {/* Row 1 */}
        <circle cx="4" cy="4" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
        <circle cx="12" cy="4" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
        {/* Strategically highlighted matte-blue dot at top-right (col 3, row 1) */}
        <circle cx="20" cy="4" r={dimensions.dotR + 0.3} fill="#5B82FF" />

        {/* Row 2 */}
        <circle cx="4" cy="12" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
        <circle cx="12" cy="12" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
        <circle cx="20" cy="12" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />

        {/* Row 3 */}
        <circle cx="4" cy="20" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
        <circle cx="12" cy="20" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
        <circle cx="20" cy="20" r={dimensions.dotR} fill="#EEF0F2" opacity="0.9" />
      </svg>

      {showText && (
        <span
          className={`font-display font-semibold tracking-tight text-[#F4F5F2] ${dimensions.text} ${textClassName}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          LabWay
        </span>
      )}
    </div>
  );
};
