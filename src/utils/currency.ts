export const formatCurrency = (amount: number, currency: string = 'IQD'): string => {
    const formatter = new Intl.NumberFormat('ar-IQ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return `${formatter.format(amount)} د.ع`;
  };
  
  export const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('ar-IQ').format(amount);
  };
  
  export const parseNumberInput = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };
  
  export const formatCompactCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} مليون`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)} ألف`;
    }
    return `${amount}`;
  };