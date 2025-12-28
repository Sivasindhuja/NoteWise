import request from 'supertest';
import app from '../index.js';
import pool from "../db.js"

describe('Notes API Endpoints', () => {
  it('should return a 200 status for the GET notes route', async () => {
    // We use a fake userId for the test
    const res = await request(app).get('/api/notes?userId=1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 404 for a non-existent route', async () => {
    const res = await request(app).get('/api/invalid-route');
    expect(res.statusCode).toEqual(404);
  });

  afterAll(async () => {
    await pool.end(); 
  },10000);

});

