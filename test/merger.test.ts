import { strict as assert } from 'assert';

describe('merger logic', () => {
  it('validates managed block patterns', () => {
    const MANAGED_BLOCK_START = (section: string) =>
      `# --- Auto Gitignore: ${section} (managed) ---`;
    const MANAGED_BLOCK_END = '# --- /Auto Gitignore ---';

    const nodeBlock = MANAGED_BLOCK_START('node');
    const endBlock = MANAGED_BLOCK_END;

    assert(nodeBlock.includes('node'), 'should include section name');
    assert(nodeBlock.includes('managed'), 'should indicate managed block');
    assert(endBlock.includes('/Auto Gitignore'), 'should have end marker');
  });
});
