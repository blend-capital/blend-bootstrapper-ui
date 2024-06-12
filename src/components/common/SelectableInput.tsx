import { useBootstrapper } from '../../hooks/bootstrapContext';
export function SelectableInput({ inputName }: { inputName: string }) {
  const { bootstrapperId, selectedOption, setSelectedOption, setId } = useBootstrapper();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
    setId(undefined);
  };

  const isSelected = selectedOption === inputName;

  return (
    <label
      style={{
        display: 'inline-block',
        padding: '10px',
        margin: '5px',
        border: '1px solid',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100px',
        background: isSelected
          ? 'linear-gradient(45deg, #FDDC5C, #FDDC5C 50%, #FDDC5C 50%, #FDDC5C)'
          : '#242424',
        color: isSelected ? '#242424' : '#FDDC5C',
      }}
    >
      <input
        type="radio"
        name="action"
        value={inputName}
        disabled={bootstrapperId == undefined || bootstrapperId == ''}
        checked={isSelected}
        onChange={handleChange}
        style={{
          display: 'none',
        }}
      />
      {inputName}
    </label>
  );
}
