import React from 'react';

export interface PaperProps {
  children: React.ReactNode;
  className?: string | undefined;
  sx?: React.CSSProperties;
}

function Paper({ children, className, sx }: PaperProps) {
  return (
    <div className={`paper${className ? ' ' + className : ''}`} style={{ ...sx }}>
      {children}
    </div>
  );
}

export default Paper;
