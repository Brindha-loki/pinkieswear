'use client';

import React from 'react';

interface ThreeDArtSelectionProps {
  onSelection: (selection: string) => void;
  initialSelection?: string;
}

const ThreeDArtSelection: React.FC<ThreeDArtSelectionProps> = ({
  onSelection,
  initialSelection,
}) => {
  const [selected, setSelected] = React.useState<string | undefined>(initialSelection);

  const options = [
    {
      id: '3d-art',
      title: 'Yes, 3D art is included',
      description: 'Includes raised 3D elements and dimensional art',
      price: 249,
    },
    {
      id: 'beads-charms',
      title: 'No, but includes beads and charms',
      description: 'Features decorative beads and charm additions',
      price: 199,
    },
    {
      id: 'no-3d',
      title: 'No, does not involve 3D art',
      description: 'Flat design without 3D elements or decorations',
      price: 199,
    },
  ];

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
    onSelection(optionId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          3D Art Selection
        </h2>
        <p className="text-foreground/70">
          Does your inspiration picture include 3D art or decorative elements?
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`glass-card-strong rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              selected === option.id
                ? 'ring-2 ring-rose-gold bg-rose-gold/10'
                : 'hover:bg-rose-gold/5'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {option.title}
                </h3>
                <p className="text-foreground/70 text-sm">
                  {option.description}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-rose-gold font-bold text-xl">₹{option.price}</div>
                {selected === option.id && (
                  <div className="text-green-500 text-sm mt-1">✓ Selected</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreeDArtSelection;
