export function formatNumber(number: number | bigint, decimals: number = 7): string {
  let stringNum = number.toString();
  stringNum = stringNum.replace(/[n.]/, '');
  while (stringNum.length <= decimals) {
    stringNum = '0' + stringNum;
  }
  const index = stringNum.length - decimals;
  if (index == 1) {
    stringNum = stringNum.slice(0, index) + '.' + stringNum.slice(index);
  } else {
    stringNum = stringNum.slice(0, index) + '.' + stringNum.slice(index, index + 2);
  }
  return stringNum;
}

export function scaleNumber(number: string, decimals: number = 7): string {
  const index = number.indexOf('.');
  if (index == -1) {
    return number + '0'.repeat(decimals);
  }
  const decimalIndex = number.length - index - 1;
  if (decimalIndex > decimals) {
    return number.slice(0, decimalIndex).replace('.', '');
  }
  return number.replace('.', '') + '0'.repeat(decimals - decimalIndex);
}

export function formatAddress(address: string): string {
  return address.substring(0, 4).concat('...').concat(address.slice(-4));
}

export function buildStellarExpertLink(address: string): string {
  const base_url = import.meta.env.VITE_PUBLIC_STELLAR_EXPLORER_URL;
  if (address.startsWith('G')) {
    return `${base_url}/account/${address}`;
  } else if (address.startsWith('C')) {
    return `${base_url}/contract/${address}`;
  } else {
    return base_url;
  }
}
