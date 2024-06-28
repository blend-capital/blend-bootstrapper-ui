import React, { ChangeEvent } from 'react';
import Container from './Container';
type LabledInputProps = {
  label: string;
  placeHolder: string;
  value: string | number | undefined;
  onChange: (new_value: string) => void;
  type?: 'text' | 'number';
  disabled?: boolean;
  errorMessage?: string;
  sx?: React.CSSProperties;
};

function LabeledInput({
  label,
  placeHolder,
  type = 'text',
  value,
  onChange,
  sx,
  disabled = false,
  errorMessage,
}: LabledInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    if (type === 'number' && val !== '') {
      const sanitizedValue = val.replace(/[^0-9.\.]/gi, '');

      onChange(sanitizedValue);
    } else {
      onChange(val);
    }
  }
  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        width: '50%',
        margin: '0px 0',
        alignItems: 'center',
        ...sx,
      }}
    >
      {label != '' && (
        <label style={{ width: '110px', textAlign: 'left', marginRight: '10px' }}>{label}</label>
      )}
      <Container
        sx={{
          flexDirection: 'column',
          padding: 0,
          justifyContent: 'flex-start',
          flexGrow: 1,
          alignItems: 'center',
        }}
      >
        {disabled !== undefined && !disabled ? (
          <input
            type="text"
            placeholder={placeHolder}
            value={value}
            style={{ flexGrow: 1, width: '100%' }}
            onChange={handleChange}
          />
        ) : (
          <input
            type="text"
            placeholder={placeHolder}
            style={{ flexGrow: 1, borderColor: 'red', width: '100%' }}
            value={value}
            onChange={handleChange}
          />
        )}

        {disabled && errorMessage ? (
          <p
            style={{
              color: 'red',
              fontSize: '10px',
              margin: '0',
              height: '5px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {errorMessage}
          </p>
        ) : (
          <p style={{ fontSize: '1ex', margin: '0', width: '100%', height: '5px' }}>{''}</p>
        )}
      </Container>
    </Container>
  );
}

export default LabeledInput;
