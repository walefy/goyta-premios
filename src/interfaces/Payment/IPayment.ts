export interface CreatePaymentResult {
  id: number,
  status: string,
  copyPaste: string,
  externalUrl: string,
  qrCodeBase64: string,
}

export type CreatePaymentWithoutId = Omit<CreatePaymentResult, 'id'>;

export interface IPayment {
  create(amount: number, payerEmail: string, description: string, dateOfExpiration: string): Promise<CreatePaymentResult>;
  get(id: number): Promise<string>;
  cancel(id: number): Promise<string>;
  refund(id: number): Promise<void>;
}
