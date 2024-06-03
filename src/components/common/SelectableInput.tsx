import { useBootstrapper } from '../../hooks/bootstrapContext';
export function SelectableInput({ inputName }: { inputName: string }) {
  const { bootstrapperId, selectedOption, setSelectedOption, setId } = useBootstrapper();

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
      <input
        type="radio"
        id="option1"
        name="option"
        value={inputName}
        checked={selectedOption === inputName}
        disabled={bootstrapperId == undefined || bootstrapperId == ''}
        onChange={(e) => {
          setSelectedOption(e.target.value);
          setId(undefined);
        }}
      />
      <label htmlFor="option1">{inputName}</label>
    </div>
  );
}
