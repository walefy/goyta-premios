import { app, clearDatabase } from '../AppTest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { vi } from 'vitest';
import { getAdminToken, getToken } from '../helpers/getToken';
import { Ticket } from '../../src/database/models/Ticket';
import { MercadoPagoPayment } from '../../src/entities/Payment';
import jwt from 'jsonwebtoken';

describe('Integration test (Ticket)', () => {
  const originalEnv = process.env;

  afterEach(async () => {
    await clearDatabase();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a ticket', async () => {
    const token = await getAdminToken(app);

    const response = await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'Test Ticket');
    expect(response.body).toHaveProperty('description', 'teste descrição');
    expect(response.body).toHaveProperty('price', 0.1);
    expect(response.body).toHaveProperty('quantity', 100);
    expect(response.body).toHaveProperty('limitByUser', 5);
    expect(response.body).toHaveProperty('prizes', []);
    expect(response.body).toHaveProperty('status', 'running');
    expect(response.body.quotas).toHaveLength(100);
  });

  it('should not create a ticket without a token', async () => {
    const response = await supertest(app)
      .post('/ticket')
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });

  it('should not create a ticket with a user token', async () => {
    const token = await getToken(app);

    const response = await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'You do not have permission');
  });

  it('should not create a ticket with invalid data', async () => {
    const token = await getAdminToken(app);

    const response = await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Required at prizes');
  });

  it('should delete a ticket', async () => {
    const token = await getAdminToken(app);

    const { body: ticket } = await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    const response = await supertest(app)
      .delete(`/ticket/${ticket.id}`)
      .set('Authorization', token);

    expect(response.status).toBe(204);
    expect(await Ticket.findOne({ where: { id: ticket.id } })).toBeNull();
  });

  it('should not delete a ticket without a token', async () => {
    const response = await supertest(app)
      .delete('/ticket/65c660383c4b817eb7f722ec');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });

  it('should not delete a ticket with a user token', async () => {
    const token = await getToken(app);

    const response = await supertest(app)
      .delete('/ticket/65c660383c4b817eb7f722ec')
      .set('Authorization', token);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'You do not have permission');
  });

  it('should not delete a ticket with invalid id', async () => {
    const token = await getAdminToken(app);

    const response = await supertest(app)
      .delete('/ticket/65c660383c4b817eb7f722ec')
      .set('Authorization', token);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Ticket not found');
  });

  it('should get a ticket', async () => {
    const token = await getAdminToken(app);

    const { body: ticket } = await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    const response = await supertest(app)
      .get(`/ticket/${ticket.id}`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', ticket.id);
    expect(response.body).toHaveProperty('name', 'Test Ticket');
    expect(response.body).toHaveProperty('description', 'teste descrição');
    expect(response.body).toHaveProperty('price', 0.1);
    expect(response.body).toHaveProperty('quantity', 100);
    expect(response.body).toHaveProperty('limitByUser', 5);
    expect(response.body).toHaveProperty('prizes', []);
    expect(response.body).toHaveProperty('status', 'running');
    expect(response.body.quotas).toHaveLength(100);
  });

  it('should not get a ticket without a token', async () => {
    const response = await supertest(app)
      .get('/ticket/65c660383c4b817eb7f722ec');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });

  it('should update a ticket', async () => {
    const token = await getAdminToken(app);

    const { body: ticket } = await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    const response = await supertest(app)
      .put(`/ticket/${ticket.id}`)
      .set('Authorization', token)
      .send({
        name: 'Test Ticket Updated',
        description: "teste descrição updated",
        price: 0.2,
        quantity: 100,
        limitByUser: 10,
        prizes: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', ticket.id);
    expect(response.body).toHaveProperty('name', 'Test Ticket Updated');
    expect(response.body).toHaveProperty('description', 'teste descrição updated');
    expect(response.body).toHaveProperty('price', 0.2);
    expect(response.body).toHaveProperty('limitByUser', 10);
    expect(response.body).toHaveProperty('prizes', []);
    expect(response.body).toHaveProperty('status', 'running');
  });

  it('should not update a ticket without a token', async () => {
    const response = await supertest(app)
      .put('/ticket/65c660383c4b817eb7f722ec')
      .send({
        name: 'Test Ticket Updated',
        description: "teste descrição updated",
        price: 0.2,
        quantity: 100,
        limitByUser: 10,
        prizes: [],
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });

  it('should not update a ticket with a user token', async () => {
    const token = await getToken(app);

    const response = await supertest(app)
      .put('/ticket/65c660383c4b817eb7f722ec')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket Updated',
        description: "teste descrição updated",
        price: 0.2,
        quantity: 100,
        limitByUser: 10,
        prizes: [],
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'You do not have permission');
  });

  it('should not update a ticket with invalid data', async () => {
    const token = await getAdminToken(app);

    const response = await supertest(app)
      .put('/ticket/65c660383c4b817eb7f722ec')
      .set('Authorization', token)
      .send({
        name: 't',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'String must contain at least 3 character(s) at name');
  });

  it('should not update a ticket with invalid id', async () => {
    const token = await getAdminToken(app);

    const response = await supertest(app)
      .put('/ticket/65c660383c4b817eb7f722ec')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket Updated',
        description: "teste descrição updated",
        price: 0.2,
        quantity: 100,
        limitByUser: 10,
        prizes: [],
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Ticket not found');
  });

  it('should get all tickets', async () => {
    const token = await getAdminToken(app);

    await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket 1',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    await supertest(app)
      .post('/ticket')
      .set('Authorization', token)
      .send({
        name: 'Test Ticket 2',
        description: "teste descrição",
        price: 0.1,
        quantity: 100,
        limitByUser: 5,
        prizes: [],
      });

    const response = await supertest(app)
      .get('/ticket')
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should not get all tickets without a token', async () => {
    const response = await supertest(app)
      .get('/ticket');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });

  it('should get all tickets even if there are no tickets', async () => {
    const token = await getAdminToken(app);

    const response = await supertest(app)
      .get('/ticket')
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should buy a quota', async () => {
    const token = await getAdminToken(app);
    const user = jwt.decode(token.split(' ')[1]) as { id: string };

    vi.spyOn(MercadoPagoPayment.prototype, 'create').mockResolvedValue({
      id: 2255,
      status: 'pending',
      copyPaste: 'qrCopyPaste',
      externalUrl: 'https://www.test.com',
      qrCodeBase64: 'qrCodeBase64',
    });

    const { body: ticket } = await supertest(app).post('/ticket').set('Authorization', token).send({
      name: 'Test Ticket',
      description: "teste descrição",
      price: 0.1,
      quantity: 1,
      limitByUser: 1,
      prizes: [],
    });

    const response = await supertest(app)
      .post(`/ticket/${ticket.id}/buy-quota`)
      .set('Authorization', token)
      .send({ drawnNumber: '1', userId: user.id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'pending');
    expect(response.body).toHaveProperty('copyPaste', 'qrCopyPaste');
    expect(response.body).toHaveProperty('externalUrl', 'https://www.test.com');
    expect(response.body).toHaveProperty('qrCodeBase64', 'qrCodeBase64');
  });

  it('should not buy a quota without a token', async () => {
    const response = await supertest(app)
      .post('/ticket/65c660383c4b817eb7f722ec/buy-quota')
      .send({ drawnNumber: '1', userId: '65c660383c4b817eb7f722ec' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token not found');
  });
});
