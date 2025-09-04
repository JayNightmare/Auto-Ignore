import * as path from 'path';
import Mocha from 'mocha';

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'bdd', color: true });

  const testRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    // Add individual test files
    mocha.addFile(path.resolve(testRoot, 'detector.test.ts'));
    mocha.addFile(path.resolve(testRoot, 'merger.test.ts'));
    mocha.addFile(path.resolve(testRoot, 'secrets.test.ts'));

    mocha.run((failures: number) => {
      if (failures) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
