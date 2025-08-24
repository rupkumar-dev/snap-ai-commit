import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

const ENV_FILE = path.resolve(process.cwd(), '.env');
const GITIGNORE_FILE = path.resolve(process.cwd(), '.gitignore');

// Save API key to .env
function saveApiKeyToEnv(key) {
  fs.writeFileSync(ENV_FILE, `OPENAI_API_KEY=${key}\n`, { flag: 'w' });
  process.env.OPENAI_API_KEY = key;
}

// Add .env to .gitignore
function addEnvToGitignore() {
  let content = '';
  if (fs.existsSync(GITIGNORE_FILE)) {
    content = fs.readFileSync(GITIGNORE_FILE, 'utf-8');
    if (!content.includes('.env')) {
      content += '\n.env\n';
      fs.writeFileSync(GITIGNORE_FILE, content);
    }
  } else {
    fs.writeFileSync(GITIGNORE_FILE, '.env\n');
  }
}

// Ask API key interactively
async function askApiKey() {
  const answer = await inquirer.prompt({
    type: 'input',
    name: 'apiKey',
    message: '🔑 Enter your OpenAI API key:'
  });
  return answer.apiKey.trim();
}

// Ask how to store API key when .gitignore is missing
async function askStorageOption() {
  const answer = await inquirer.prompt({
    type: 'list',
    name: 'option',
    message: '.gitignore not found. Choose how to store your API key:',
    choices: [
      'Create .gitignore and add .env (recommended)',
      'Store API key only in memory (will prompt every run)',
      'Save .env anyway without modifying .gitignore',
      'Cancel'
    ]
  });
  return answer.option;
}

// Load API key with optional validation
export async function loadConfig(validateKey) {
  let apiKey = process.env.OPENAI_API_KEY || (fs.existsSync(ENV_FILE)
    ? fs.readFileSync(ENV_FILE, 'utf-8').split('=')[1].trim()
    : null);

  while (!apiKey || (validateKey && !(await validateKey(apiKey)))) {
    if (apiKey) console.log("❌ Stored API key is invalid. Please enter a valid key.");

    if (!fs.existsSync(GITIGNORE_FILE)) {
      const choice = await askStorageOption();

      if (choice === 'Cancel') process.exit(1);

      apiKey = await askApiKey();

      if (choice === 'Create .gitignore and add .env (recommended)') {
        addEnvToGitignore();
        saveApiKeyToEnv(apiKey);
      } else if (choice === 'Store API key only in memory (will prompt every run)') {
        process.env.OPENAI_API_KEY = apiKey;
      } else if (choice === 'Save .env anyway without modifying .gitignore') {
        saveApiKeyToEnv(apiKey);
      }

    } else {
      // Gitignore exists, safe to save
      apiKey = await askApiKey();
      addEnvToGitignore();
      saveApiKeyToEnv(apiKey);
    }
  }

  return { apiKey };
}
