import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  sx?: React.CSSProperties;
};

function Container({ children, sx }: ContainerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        padding: '10px',
        marginTop: '5px',
        marginBottom: '5px',
        ...sx,
      }}
    >
      {children}
    </div>
  );
}

export default Container;
