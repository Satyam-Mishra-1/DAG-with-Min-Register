
import React from 'react';

const Header = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-6 px-4 mb-8 rounded-xl shadow-lg">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Code Flow Optimizer Visualizer</h1>
        <p className="text-lg opacity-90">
          Visualize three address code optimization techniques and register allocation
        </p>
      </div>
    </div>
  );
};

export default Header;
