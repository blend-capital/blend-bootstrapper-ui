import { Address } from '@stellar/stellar-sdk';

export function isValidAddress(address: string): boolean {
  // If the address is not valid, this will throw an error
  try {
    Address.fromString(address);
    return true;
  } catch {
    return false;
  }
}
