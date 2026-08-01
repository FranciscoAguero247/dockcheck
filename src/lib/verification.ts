export function evaluateLineCount(expectedQty: number, countedQty: number) {
  if (countedQty === expectedQty) {
    return { matched: true, discrepancy: null };
  }

  return {
    matched: false,
    discrepancy: {
      type: countedQty < expectedQty ? 'shortage' : 'overage',
      quantity: Math.abs(countedQty - expectedQty),
      note: countedQty < expectedQty ? 'Counted fewer than expected.' : 'Counted more than expected.',
    },
  };
}

export function computeShipmentStatus(lines: Array<{ expectedQty: number; countedQty: number }>) {
  const hasMismatch = lines.some((line) => evaluateLineCount(line.expectedQty, line.countedQty).matched === false);
  return hasMismatch ? 'discrepancy' : 'verified';
}

export function computeAccuracy(lines: Array<{ expectedQty: number; countedQty: number }>) {
  if (lines.length === 0) {
    return 0;
  }

  const matched = lines.filter((line) => evaluateLineCount(line.expectedQty, line.countedQty).matched).length;
  return Math.round((matched / lines.length) * 100);
}
