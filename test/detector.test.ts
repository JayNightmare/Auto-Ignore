import { strict as assert } from 'assert';

describe('basic functionality', () => {
  it('validates basic rules data structure', () => {
    const fs = require('fs');
    const path = require('path');
    const rulesPath = path.join(__dirname, '../src/data/rules.json');

    assert(fs.existsSync(rulesPath), 'rules.json should exist');

    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    assert(typeof rules === 'object', 'rules should be an object');
    assert(Array.isArray(rules.os), 'os rules should be an array');
    assert(Array.isArray(rules.node), 'node rules should be an array');
    assert(rules.os.includes('.DS_Store'), 'os rules should include .DS_Store');
  });
});
