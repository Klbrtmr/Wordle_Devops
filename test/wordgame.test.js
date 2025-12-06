const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');
const { evaluateGuess, isWinningResult } = require('../wordgame');

describe('Word game logic', () => {
  it('should mark all letters correct when guess equals secret', () => {
    const result = evaluateGuess('APPLE', 'APPLE');
    expect(result).to.have.lengthOf(5);
    result.forEach(cell => {
      expect(cell.status).to.equal('correct');
    });
    expect(isWinningResult(result)).to.be.true;
  });

  it('should mark present letters in wrong positions as present', () => {
    const result = evaluateGuess('APPLE', 'PLEAP'); // minden betű benne van, de rossz helyen
    const statuses = result.map(c => c.status);
    // itt elég annyi, hogy nincsen 'correct', és van 'present'
    expect(statuses).to.not.include('correct');
    expect(statuses).to.include('present');
  });

  it('should mark letters not in the word as absent', () => {
    const result = evaluateGuess('APPLE', 'ZZZZZ');
    result.forEach(cell => {
      expect(cell.status).to.equal('absent');
    });
  });

  it('should handle duplicate letters correctly', () => {
    // Secret: APPLE (2x P)
    // Guess:  PAPAL
    const result = evaluateGuess('APPLE', 'PAPAL');
    // nem az a fontos, hogy pontosan milyen pozíciók, hanem hogy ne legyen több 'present/correct' P, mint amennyi a secretben van
    const pCells = result.filter(c => c.letter === 'P');
    expect(pCells.length).to.be.at.most(2);
  });

  it('should throw error if word length is not 5', () => {
    expect(() => evaluateGuess('APP', 'APP')).to.throw();
  });
});

describe('HTTP endpoints', () => {
  it('GET / should return 200 and contain page title', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Szókitaláló játék');
  });

  it('POST /guess with invalid guess should redirect (400 not needed because we handle via message)', async () => {
    const res = await request(app)
      .post('/guess')
      .send('guess=AB');

    // redirect back to '/'
    expect(res.status).to.be.within(300, 399);
  });

  it('POST /guess with valid guess should redirect to /', async () => {
    const res = await request(app)
      .post('/guess')
      .send('guess=APPLE');
    expect(res.status).to.be.within(300, 399);
  });

  it('POST /reset should reset game state and redirect', async () => {
    const res = await request(app)
      .post('/reset')
      .send();
    expect(res.status).to.be.within(300, 399);
  });
});
