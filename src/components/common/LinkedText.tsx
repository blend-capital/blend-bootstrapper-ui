import React from 'react';
import Container from './Container';

export interface LinkedTextProps {
  text: string;
  link: string;
  sx?: React.CSSProperties;
}

export function LinkedText({ text, link, sx }: LinkedTextProps) {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          ...sx,
        }}
      >
        {text !== '' && (
          <p
            style={{
              wordBreak: 'break-all',
            }}
          >
            {text}
          </p>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px">
          <path
            fill="currentColor"
            d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"
          />
        </svg>
      </Container>
    </a>
  );
}
