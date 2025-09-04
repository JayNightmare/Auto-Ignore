/*
  detector.ts
  Scans workspace for stack signals and returns sections to include in .gitignore with confidence scores.
*/
import * as vscode from 'vscode';

interface StackDetection {
  sections: string[];
  confidence: Record<string, number>;
}

export async function detectStack(targets: string[]): Promise<StackDetection> {
  const sections = new Set<string>();
  const confidence: Record<string, number> = {};

  // Always include OS and editor basics
  sections.add('os');
  sections.add('editor');

  try {
    // Scan for Node.js/TypeScript signals
    const nodeFiles = await vscode.workspace.findFiles(
      '{package.json,tsconfig.json,yarn.lock,pnpm-lock.yaml,bun.lockb}',
      '**/node_modules/**'
    );
    if (nodeFiles.length > 0) {
      sections.add('node');
      confidence.node = 0.9;

      // Check for specific frameworks
      for (const file of nodeFiles) {
        if (file.path.endsWith('package.json')) {
          const content = await vscode.workspace.fs.readFile(file);
          const packageJson = JSON.parse(content.toString());
          const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

          if (deps['react-native'] || deps['expo']) {
            sections.add('reactNative');
            sections.add('mobile');
            confidence.reactNative = 0.8;
          }

          if (deps['jest'] || deps['playwright'] || deps['cypress']) {
            sections.add('testing');
            confidence.testing = 0.7;
          }
        }
      }
    }

    // Scan for Python signals
    const pythonFiles = await vscode.workspace.findFiles(
      '{pyproject.toml,requirements.txt,poetry.lock,setup.py}',
      '**/.venv/**'
    );
    if (pythonFiles.length > 0) {
      sections.add('python');
      confidence.python = 0.9;
    }

    // Scan for Java/Kotlin signals
    const javaFiles = await vscode.workspace.findFiles(
      '{build.gradle,build.gradle.kts,settings.gradle*,*.iml}',
      '**/build/**'
    );
    if (javaFiles.length > 0) {
      sections.add('javaKotlin');
      confidence.javaKotlin = 0.8;
    }

    // Scan for mobile development
    const mobileFiles = await vscode.workspace.findFiles(
      '{android/**,ios/**,Pods/**}',
      '**/node_modules/**'
    );
    if (mobileFiles.length > 0) {
      sections.add('mobile');
      confidence.mobile = 0.9;
    }

    // Scan for Docker
    const dockerFiles = await vscode.workspace.findFiles(
      '{Dockerfile,docker-compose.yml,docker-compose.yaml}',
      '**'
    );
    if (dockerFiles.length > 0) {
      sections.add('docker');
      confidence.docker = 0.9;
    }

    // Always include common sections
    sections.add('logs');
    sections.add('secrets');
  } catch (error) {
    console.error('Error detecting stack:', error);
  }

  return {
    sections: Array.from(sections),
    confidence,
  };
}
