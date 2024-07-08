import React from 'react';

export type ContainerProps = {
  children: React.ReactNode;
  className?: string | undefined;
  sx?: React.CSSProperties;
};

function Container({ children, className, sx }: ContainerProps) {
  return (
    <div
      className={`container${className ? ' ' + className : ''}`}
      style={{
        ...sx,
      }}
    >
      {children}
    </div>
  );
}

export default Container;
