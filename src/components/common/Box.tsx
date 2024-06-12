import React from 'react';

type BoxProps = {
  children: React.ReactNode;
  sx?: React.CSSProperties;
};

function Box({ children, sx }: BoxProps) {
  return (
    <div
      style={{
        display: 'flex',
        border: '2px solid black',
        flexWrap: 'wrap',
        padding: '10px',
        ...sx,
      }}
    >
      {children}
    </div>
  );
}

export default Box;
