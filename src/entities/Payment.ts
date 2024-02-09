import { MercadoPagoConfig, Payment, PaymentRefund } from 'mercadopago';
import { IPayment } from '../interfaces/Payment/IPayment';

export class MercadoPagoPayment implements IPayment {
  #payment: Payment;
  #paymentRefund: PaymentRefund;

  constructor() {
    const accessToken = process.env.MP_ACCESS_TOKEN || 'TEST-5068813690404568-020816-41a641f328539d1dd7897c6a18211289-272153962';

    if (!accessToken) {
      throw new Error('Mercado Pago access token not found');
    }

    const config = new MercadoPagoConfig({
      accessToken,
    });


    this.#payment = new Payment(config);
    this.#paymentRefund = new PaymentRefund(config);
  }

  async create(
    amount: number,
    payerEmail: string,
    description: string,
    dateOfExpiration: string,
    ticketId: string,  
  ) {
    const paymentResponse = await this.#payment.create({
      body: {
        payment_method_id: 'pix',
        transaction_amount: amount,
        description: description,
        payer: {
          email: payerEmail,
        },
        date_of_expiration: dateOfExpiration,
        notification_url: 'https://webhook.site/06c46252-a222-49ce-a772-caf5286996c5', // preciso de um endpoint up
      },
    });

    if (paymentResponse.api_response.status !== 201) {
      throw new Error('Payment not created');
    }

    const result = {
      id: paymentResponse.id as number,
      status: paymentResponse.status as string,
      copyPaste: paymentResponse.point_of_interaction?.transaction_data?.qr_code as string,
      externalUrl: paymentResponse.point_of_interaction?.transaction_data?.ticket_url as string,
      qrCodeBase64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64 as string,
    };

    return result;
  }

  async get(id: number) {
    console.log(id);
    const response = await this.#payment.get({ id });
    

    if (response.status === undefined) {
      throw new Error('Payment not found');
    }

    return response.status;
  }

  async cancel(id: number) {
    const response = await this.#payment.cancel({ id });

    if (response.status === undefined) {
      throw new Error('Payment not canceled');
    }

    return response.status;
  }

  async refund(id: number) {
    const response = await this.#paymentRefund.create({
      payment_id: id,

    });

    if (response.status === undefined) {
      throw new Error('Payment not refunded');
    }
  }
}
