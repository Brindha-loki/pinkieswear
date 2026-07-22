'use client';

import React from 'react';

type ShapeFamily = 'oval' | 'square' | 'almond' | 'coffin' | 'stiletto';
type LengthVariant = 'short' | 'medium' | 'long' | 'xl';

const LENGTH_HEIGHT: Record<LengthVariant, number> = {
  short: 22,
  medium: 32,
  long: 44,
  xl: 56,
};

function parseShape(shape: string): { family: ShapeFamily; length: LengthVariant } {
  const lower = shape.toLowerCase();
  let family: ShapeFamily = 'oval';
  if (lower.includes('square')) family = 'square';
  else if (lower.includes('almond')) family = 'almond';
  else if (lower.includes('coffin')) family = 'coffin';
  else if (lower.includes('stiletto')) family = 'stiletto';

  let length: LengthVariant = 'short';
  if (lower.startsWith('xl')) length = 'xl';
  else if (lower.startsWith('long')) length = 'long';
  else if (lower.startsWith('medium')) length = 'medium';

  return { family, length };
}

function getTipPath(family: ShapeFamily, length: LengthVariant): string {
  const h = LENGTH_HEIGHT[length];
  const baseY = 88 - h;
  const cx = 32;
  const halfW = 14;

  switch (family) {
    case 'oval':
      return `M ${cx - halfW} ${baseY} Q ${cx - halfW} ${baseY - h * 0.85} ${cx} ${baseY - h} Q ${cx + halfW} ${baseY - h * 0.85} ${cx + halfW} ${baseY} Z`;
    case 'square':
      return `M ${cx - halfW} ${baseY} L ${cx - halfW} ${baseY - h} L ${cx + halfW} ${baseY - h} L ${cx + halfW} ${baseY} Z`;
    case 'almond':
      return `M ${cx - halfW} ${baseY} Q ${cx - halfW + 2} ${baseY - h * 0.5} ${cx} ${baseY - h} Q ${cx + halfW - 2} ${baseY - h * 0.5} ${cx + halfW} ${baseY} Z`;
    case 'coffin': {
      const taper = halfW * 0.55;
      return `M ${cx - halfW} ${baseY} L ${cx - taper} ${baseY - h} L ${cx + taper} ${baseY - h} L ${cx + halfW} ${baseY} Z`;
    }
    case 'stiletto':
      return `M ${cx - halfW} ${baseY} Q ${cx - halfW + 4} ${baseY - h * 0.6} ${cx} ${baseY - h} Q ${cx + halfW - 4} ${baseY - h * 0.6} ${cx + halfW} ${baseY} Z`;
    default:
      return `M ${cx - halfW} ${baseY} Q ${cx} ${baseY - h} ${cx + halfW} ${baseY} Z`;
  }
}

interface NailShapeIconProps {
  shape: string;
  className?: string;
}

const NailShapeIcon: React.FC<NailShapeIconProps> = ({ shape, className = 'w-full h-full' }) => {
  const { family, length } = parseShape(shape);
  const tipPath = getTipPath(family, length);

  return (
    <svg
      viewBox="0 0 64 96"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Finger base */}
      <path
        d="M 20 20 C 20 8 44 8 44 20 L 44 88 C 44 92 20 92 20 88 Z"
        fill="#FDF2F6"
        stroke="#E85D9C"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Nail bed */}
      <rect x="22" y="18" width="20" height="70" rx="10" fill="#FFF5F8" stroke="#F0B8D0" strokeWidth="1" />
      {/* Nail tip shape */}
      <path
        d={tipPath}
        fill="#E85D9C"
        fillOpacity="0.85"
        stroke="#C44D82"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Shine highlight */}
      <ellipse cx="28" cy={88 - LENGTH_HEIGHT[length] * 0.4} rx="3" ry="6" fill="white" fillOpacity="0.35" />
    </svg>
  );
};

export default NailShapeIcon;
