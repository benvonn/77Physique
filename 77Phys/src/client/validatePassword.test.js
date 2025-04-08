import validatePassword from './validatePassword'; // go up one level to get to the function

describe('validatePassword', () => {
  it('returns true for valid passwords', () => {
    expect(validatePassword('GoodPass1!')).toBe(true);
  });

  it('fails with no uppercase', () => {
    expect(validatePassword('badpass1!')).toBe(false);
  });

  it('fails with no lowercase', () => {
    expect(validatePassword('BADPASS1!')).toBe(false);
  });

  it('fails with no number', () => {
    expect(validatePassword('BadPass!')).toBe(false);
  });

  it('fails with no special character', () => {
    expect(validatePassword('BadPass1')).toBe(false);
  });

  it('fails with empty string', () => {
    expect(validatePassword('')).toBe(false);
  });
});
