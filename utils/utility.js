export const adrEllipsis = (account, length) => {
  if (account) {
    const start = account.slice(0, length);
    const end = account.slice(-length);
    return `${start}...${end}`;
  }
  return "";
}

export const getApprovalStatus = (status) => {

  if (status == 0) {
    return {
      value: 0,
      label: 'Approved',
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
  }

  else if (status == 1) {
    return {
      value: 1,
      label: 'Revoked',
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
  }

  return {
    value: 2,
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };
};