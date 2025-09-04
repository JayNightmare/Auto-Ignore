import { strict as assert } from 'assert';

describe('secrets detection patterns', () => {
  it('validates sensitive file patterns', () => {
    const SENSITIVE_PATTERNS = [
      /\.env$/,
      /\.env\./,
      /\.pem$/,
      /\.key$/,
      /\.p12$/,
      /\.keystore$/,
      /\.jks$/,
      /secret/i,
      /password/i,
      /credential/i,
      /token/i,
    ];

    assert(SENSITIVE_PATTERNS[0].test('.env'), 'should match .env files');
    assert(SENSITIVE_PATTERNS[1].test('.env.local'), 'should match .env.* files');
    assert(SENSITIVE_PATTERNS[2].test('cert.pem'), 'should match .pem files');
    assert(SENSITIVE_PATTERNS[7].test('secret-file.txt'), 'should match files with secret in name');
    assert(!SENSITIVE_PATTERNS[0].test('package.json'), 'should not match normal files');
  });
});
