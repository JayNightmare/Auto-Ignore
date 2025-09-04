/*
  merger.ts
  Merges existing .gitignore with managed blocks for each section, de-dupes, sorts, and preserves user content.
*/
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const MANAGED_BLOCK_START = (section: string) => `# --- Auto Gitignore: ${section} (managed) ---`;
const MANAGED_BLOCK_END = '# --- /Auto Gitignore ---';

export function buildGitignore(sections: string[]): string {
  const rulesPath = path.join(__dirname, '../data/rules.json');
  let rules: Record<string, string[]> = {};

  try {
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    rules = JSON.parse(rulesContent);
  } catch (error) {
    console.error('Error loading rules:', error);
    return '';
  }

  const blocks: string[] = [];

  for (const section of sections) {
    if (rules[section]) {
      const patterns = rules[section];
      const block = [MANAGED_BLOCK_START(section), ...patterns, MANAGED_BLOCK_END, ''].join('\n');
      blocks.push(block);
    }
  }

  return blocks.join('\n');
}

export async function mergeGitignore(targets: string[], proposed: string): Promise<string> {
  if (targets.length === 0) {
    return proposed;
  }

  const gitignorePath = path.join(targets[0], '.gitignore');
  let existing = '';

  try {
    if (fs.existsSync(gitignorePath)) {
      existing = fs.readFileSync(gitignorePath, 'utf8');
    }
  } catch (error) {
    console.error('Error reading .gitignore:', error);
  }

  // If no existing .gitignore, return proposed
  if (!existing.trim()) {
    return proposed;
  }

  // Parse existing content and preserve user sections
  const lines = existing.split('\n');
  const userContent: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this is a managed block start
    if (line.startsWith('# --- Auto Gitignore:') && line.includes('(managed)')) {
      // Skip until end of managed block
      i++;
      while (i < lines.length && lines[i] !== MANAGED_BLOCK_END) {
        i++;
      }
      if (i < lines.length) {
        i++; // Skip the end marker
      }
    } else {
      userContent.push(line);
      i++;
    }
  }

  // Combine user content with new proposed content
  const userSection = userContent.join('\n').trim();
  const finalContent = userSection ? `${userSection}\n\n${proposed}` : proposed;

  return finalContent;
}

export async function writeGitignore(targetPath: string, content: string): Promise<void> {
  const gitignorePath = path.join(targetPath, '.gitignore');
  try {
    await fs.promises.writeFile(gitignorePath, content, 'utf8');
  } catch (error) {
    console.error('Error writing .gitignore:', error);
    throw error;
  }
}
