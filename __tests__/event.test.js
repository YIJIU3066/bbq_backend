// describe('Sample Test', () => {
//     it('should test that true === true', () => {
//         expect(true).toBe(true);
//     });
// });

const request = require('supertest');
const app = require('../app');

describe('GET /event/:event_id', () => {
    it('should return 404 if event not found', async () => {
        const res = await request(app).get('/event/999999');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

    it('shuold return event data if event exists', async () => {
        const res = await request(app).get('/event/1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('eId');
    });
});
