import React, { useContext } from 'react';
import { useState } from 'react';
import { useWallet } from '../hooks/wallet';

export interface ActionOptionsProps {}

export interface IActionContext {
  selectedOption?: string;
  setSelectedOption: (selectedOption: string) => void;
  bootstrapperId?: string;
  setBootstrapperId: (bootstrapperId: string) => void;
}

export const ActionContext = React.createContext({} as IActionContext);

export function ActionProvider({ children = null as any }) {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [bootstrapperId, setBootstrapperId] = useState<string | undefined>(undefined);
  return (
    <ActionContext.Provider
      value={{ selectedOption, setSelectedOption, bootstrapperId, setBootstrapperId }}
    >
      <div className="address">
        <input
          type="text"
          placeholder="Enter Bootstrapper Address"
          value={bootstrapperId}
          style={{ height: '30px', width: '200px' }}
          onChange={(e) => setBootstrapperId(e.target.value)}
        />{' '}
        {/* Text box added here */}
      </div>
      {children}
    </ActionContext.Provider>
  );
}

export function ActionOptions() {
  const { selectedOption, setSelectedOption } = useContext(ActionContext);
  const { bootstrapperId } = useContext(ActionContext);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <input
          type="radio"
          id="option1"
          name="option"
          value="option1"
          checked={selectedOption === 'option1'}
          disabled={bootstrapperId == undefined || bootstrapperId == ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        />
        <label htmlFor="option1">New Bootstrap</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <input
          type="radio"
          id="option2"
          name="option"
          value="option2"
          checked={selectedOption === 'option2'}
          disabled={bootstrapperId == undefined || bootstrapperId == ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        />
        <label htmlFor="option2">Join Bootstrap</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <input
          type="radio"
          id="option3"
          name="option"
          value="option3"
          checked={selectedOption === 'option3'}
          disabled={bootstrapperId == undefined || bootstrapperId == ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        />
        <label htmlFor="option3">Exit Bootstrap</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <input
          type="radio"
          id="option4"
          name="option"
          value="option4"
          checked={selectedOption === 'option4'}
          disabled={bootstrapperId == undefined || bootstrapperId == ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        />
        <label htmlFor="option4">Close Bootstrap</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <input
          type="radio"
          id="option5"
          name="option"
          value="option5"
          checked={selectedOption === 'option5'}
          disabled={bootstrapperId == undefined || bootstrapperId == ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        />
        <label htmlFor="option5">Claim Bootstrap</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <input
          type="radio"
          id="option6"
          name="option"
          value="option6"
          checked={selectedOption === 'option6'}
          disabled={bootstrapperId == undefined || bootstrapperId == ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        />
        <label htmlFor="option6">Refund Bootstrap</label>
      </div>
    </div>
  );
}

export function DisplayAction() {
  const { selectedOption } = useContext(ActionContext);
  const { bootstrapperId } = useContext(ActionContext);
  if (bootstrapperId == undefined || bootstrapperId == '') {
    return <></>;
  } else if (selectedOption == 'option1') {
    return <NewBootstrap />;
  } else if (selectedOption == 'option2') {
    return <JoinBootstrap />;
  } else if (selectedOption == 'option3') {
    return <ExitBootstrap />;
  } else if (selectedOption == 'option4') {
    return <CloseBootstrap />;
  } else if (selectedOption == 'option5') {
    return <ClaimBootstrap />;
  } else if (selectedOption == 'option6') {
    return <RefundBootstrap />;
  }
}

export function NewBootstrap() {
  const { bootstrapperId } = useContext(ActionContext);
  const [poolId, setPoolId] = useState<string | undefined>(
    'CCCPS37AFHVEPEYQYUMIQBH4TIHKKL24P7MRZQY5TONN727454AX7RL6'
  );
  const [amount, setAmount] = useState<string | undefined>('100');
  const [pairMinimumAmount, setPairMinimumAmount] = useState<string | undefined>('1');
  const [closeLedger, setCloseLedger] = useState<string | undefined>(undefined);
  const { createBootstrap, walletAddress } = useWallet();
  const [tokenIndex, setTokenIndex] = useState<number | undefined>(0);

  function SubmitTx() {
    console.log(
      walletAddress,
      bootstrapperId,
      poolId,
      amount,
      pairMinimumAmount,
      closeLedger,
      tokenIndex
    );
    if (
      walletAddress &&
      bootstrapperId &&
      poolId &&
      amount &&
      pairMinimumAmount &&
      closeLedger &&
      tokenIndex !== undefined
    ) {
      console.log('submitting tx');
      createBootstrap(bootstrapperId, {
        amount: BigInt(amount),
        bootstrapper: walletAddress,
        close_ledger: parseInt(closeLedger),
        pair_min: BigInt(pairMinimumAmount),
        pool: poolId,
        token_index: tokenIndex,
      });
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>New Bootstrap</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Pool Id: </label>
        <input
          type="text"
          placeholder="Enter Pool Address"
          style={{ flexGrow: 1 }}
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Token Index
        </label>
        <input
          type="text"
          placeholder="Enter Token Index"
          style={{ flexGrow: 1 }}
          value={tokenIndex}
          onChange={(e) => setTokenIndex(parseInt(e.target.value))}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Amount</label>
        <input
          type="text"
          placeholder="Enter Amount"
          style={{ flexGrow: 1 }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Pair Minimum Amount
        </label>
        <input
          type="text"
          placeholder="Enter Pair Minimum Amount"
          style={{ flexGrow: 1 }}
          value={pairMinimumAmount}
          onChange={(e) => setPairMinimumAmount(e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Close Ledger
        </label>
        <input
          type="text"
          style={{ flexGrow: 1 }}
          placeholder="Enter the Ledger to Close the Bootstrap"
          value={closeLedger}
          onChange={(e) => setCloseLedger(e.target.value)}
        />
      </div>
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

export function JoinBootstrap() {
  const [bootstrapId, setBootstrapId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const { bootstrapperId } = useContext(ActionContext);
  const { joinBootstrap } = useWallet();

  function SubmitTx() {
    console.log(bootstrapperId, bootstrapId, amount);
    if (bootstrapperId && bootstrapId != undefined && amount) {
      joinBootstrap(bootstrapperId, bootstrapId, BigInt(amount));
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>Join Bootstrap</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Bootstrap Id
        </label>
        <input
          type="text"
          placeholder="Enter Bootstrap Id"
          value={bootstrapId}
          onChange={(e) => setBootstrapId(parseInt(e.target.value))}
          style={{ flexGrow: 1 }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Amount</label>
        <input
          type="text"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flexGrow: 1 }}
        />
      </div>
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

export function ExitBootstrap() {
  const [bootstrapId, setBootstrapId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const { bootstrapperId } = useContext(ActionContext);
  const { exitBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && bootstrapId != undefined && amount) {
      exitBootstrap(bootstrapperId, bootstrapId, BigInt(amount));
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>Exit Bootstrap</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Bootstrap Id
        </label>
        <input
          type="text"
          placeholder="Enter Bootstrap Id"
          value={bootstrapId}
          onChange={(e) => setBootstrapId(parseInt(e.target.value))}
          style={{ flexGrow: 1 }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>Amount</label>
        <input
          type="text"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flexGrow: 1 }}
        />
      </div>
      <button onClick={() => SubmitTx}>Submit</button>
    </div>
  );
}

export function CloseBootstrap() {
  const [bootstrapId, setBootstrapId] = useState<number | undefined>(undefined);
  const { bootstrapperId } = useContext(ActionContext);
  const { closeBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && bootstrapId != undefined) {
      closeBootstrap(bootstrapperId, bootstrapId);
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>Close Bootstrap</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Bootstrap Id
        </label>
        <input
          type="text"
          placeholder="Enter Bootstrap Id"
          value={bootstrapId}
          onChange={(e) => setBootstrapId(parseInt(e.target.value))}
          style={{ flexGrow: 1 }}
        />
      </div>
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

export function ClaimBootstrap() {
  const [bootstrapId, setBootstrapId] = useState<number | undefined>(undefined);
  const { bootstrapperId } = useContext(ActionContext);
  const { claimBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && bootstrapId != undefined) {
      claimBootstrap(bootstrapperId, bootstrapId);
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>Claim Bootstrap</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Bootstrap Id
        </label>
        <input
          type="text"
          placeholder="Enter Bootstrap Id"
          value={bootstrapId}
          onChange={(e) => setBootstrapId(parseInt(e.target.value))}
          style={{ flexGrow: 1 }}
        />
      </div>
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}

export function RefundBootstrap() {
  const [bootstrapId, setBootstrapId] = useState<number | undefined>(undefined);
  const { bootstrapperId } = useContext(ActionContext);
  const { refundBootstrap } = useWallet();

  function SubmitTx() {
    if (bootstrapperId && bootstrapId != undefined) {
      refundBootstrap(bootstrapperId, bootstrapId);
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2>Refund Bootstrap</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '50%',
          margin: '10px 0',
        }}
      >
        <label style={{ width: 'auto', textAlign: 'right', marginRight: '10px' }}>
          Bootstrap Id
        </label>
        <input
          type="text"
          placeholder="Enter Bootstrap Id"
          value={bootstrapId}
          onChange={(e) => setBootstrapId(parseInt(e.target.value))}
          style={{ flexGrow: 1 }}
        />
      </div>
      <button onClick={() => SubmitTx()}>Submit</button>
    </div>
  );
}
