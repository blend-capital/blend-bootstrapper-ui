export interface SelectableButtonProps {
  text: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectableButton({ text, selected, onClick }: SelectableButtonProps): JSX.Element {
  return (
    <button
      className={`toggle-button${selected ? ' selected' : ''}`}
      onClick={onClick}
      style={{
        width: '100px',
      }}
    >
      {text}
    </button>
  );
}
