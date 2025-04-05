import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${
        className ?? ''
      }`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={`p-4 ${className ?? ''}`}>{children}</div>;
};
