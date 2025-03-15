
import React from 'react';

const SimulationHeader: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 p-4 bg-opacity-80 text-white rounded">
      <h1 className="text-2xl font-bold mb-1 animate-pulse-soft">Problema dos Três Corpos</h1>
      <p className="text-sm opacity-80">Um exemplo clássico de sistema caótico</p>
    </div>
  );
};

export default SimulationHeader;
