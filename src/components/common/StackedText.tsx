import React from 'react';
import Container from './Container';

type StackedTextProps = {
  title: string;
  text: string;
  sx?: React.CSSProperties;
};

function StackedText({ title, text, sx }: StackedTextProps) {
  return (
    <Container sx={{ padding: '10px 10px', ...sx }}>
      <h4>{title}</h4>
      <p
        style={{
          wordBreak: 'break-all',
          marginTop: '-5px',
        }}
      >
        {text}
      </p>
    </Container>
  );
}

export default StackedText;
