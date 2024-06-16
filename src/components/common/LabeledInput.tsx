import React from 'react';
import Container from './Container';
type LabledInputProps = {
  label: string;
  placeHolder: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: React.CSSProperties;
};

function LabeledInput({ label, placeHolder, value, onChange, sx }: LabledInputProps) {
  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        width: '50%',
        margin: '0px 0',
        ...sx,
      }}
    >
      <label style={{ width: '110px', textAlign: 'left', marginRight: '10px' }}>{label}</label>
      <input
        type="text"
        placeholder={placeHolder}
        style={{ flexGrow: 1 }}
        value={value}
        onChange={onChange}
      />
    </Container>
  );
}

export default LabeledInput;
