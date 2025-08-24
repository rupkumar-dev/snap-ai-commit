// README.md
# AI Commit Message (Custom)

A minimal VS Code extension that adds a button in the Source Control commit box to generate messages with your preferred AI provider.

## Features
- Button in the SCM input box: **AI: Generate Commit Message**
- Uses your staged diff (`git diff --staged`)
- Supports OpenAI, OpenRouter, or any compatible endpoint
- Title-only or title+body (multiline)
- Stores API key securely in VS Code Secret Storage

## Setup
1. Install dependencies and build
```bash
npm i
npm run build
```
2. Press `F5` to launch the extension in a new Extension Development Host.
3. Run **AI: Set API Key** from the Command Palette.
4. Stage some changes, then click the **AI** button next to the commit box or run **AI: Generate Commit Message**.

## Configuration
Open **Settings** → search **AI Commit**.
- `aiCommit.provider`: `openai` | `openrouter` | `custom`
- `aiCommit.baseUrl`: base URL for custom
- `aiCommit.model`: model name
- `aiCommit.temperature`: number
- `aiCommit.language`: message language (e.g., `en`, `hi`)
- `aiCommit.maxDiffBytes`: limit diff
- `aiCommit.multiline`: include body when true

## Packaging
```bash
npm i -g @vscode/vsce
vsce package
```
Install the resulting `.vsix` in VS Code.
```
```
// src/extension.ts
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const pexec = promisify(exec);

const SECRET_KEY = 'aiCommit.apiKey';