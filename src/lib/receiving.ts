export interface ReceivingLineInput {
  id: string;
  counted: number;
}

export interface LineItemWithExpectedQty {
  id: string;
  expected_qty: number;
}

export interface LineItemUpdatePayload {
  id: string;
  shipment_id: string;
  received_qty: number;
  is_verified: boolean;
}

export function buildLineItemUpdates(
  shipmentId: string,
  lineItems: LineItemWithExpectedQty[],
  lines: ReceivingLineInput[]
): LineItemUpdatePayload[] {
  return lines.map((line) => {
    const matchingLine = lineItems.find((item) => item.id === line.id);
    const expectedQty = matchingLine?.expected_qty ?? 0;

    return {
      id: line.id,
      shipment_id: shipmentId,
      received_qty: line.counted,
      is_verified: line.counted === expectedQty,
    };
  });
}
