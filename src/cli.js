import chalk from "chalk";
import { getStagedDiff, makeCommit } from "./git.js";
import { generateCommitMessage } from "./ai.js";
import { loadConfig } from "./config.js";
import axios from "axios";

// Validate API key
async function validateApiKey(key) {
  try {
    await axios.get("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return true;
  } catch (err) {
    if (err.response?.status === 401) return false;
    throw err;
  }
}

export async function runCommit() {
  const MAX_KEY_ATTEMPTS = 3;
  let keyAttempts = 0;

  await loadConfig(validateApiKey);

  while (keyAttempts < MAX_KEY_ATTEMPTS) {
    try {
      console.log(chalk.cyan("🔍 Collecting staged changes..."));
      const diff = await getStagedDiff();

      if (!diff?.trim()) {
        console.log(chalk.yellow("⚠️ No staged changes found."));
        return;
      }

      console.log(chalk.cyan("🤖 Generating commit message..."));
      const message = await generateCommitMessage(diff);

      console.log(chalk.green("\n✨ Suggested Commit Message:\n"));
      console.log(chalk.bold(message));

      await makeCommit(message);
      console.log(chalk.green("\n✅ Commit created successfully!"));
      return;

    } catch (err) {
      if (err.message.includes("Invalid API key")) {
        keyAttempts++;
        process.env.OPENAI_API_KEY = null;
        if (keyAttempts >= MAX_KEY_ATTEMPTS) {
          console.log(chalk.red("❌ Maximum API key attempts reached. Exiting."));
          return;
        }
        await loadConfig(validateApiKey); // prompt for new key
      } else if (err.response?.status === 429) {
        console.log(chalk.red("❌ Rate limit reached (429). Please wait a few seconds and try again."));
        return;
      } else {
        console.error(chalk.red("❌ Error:"), err.message);
        return;
      }
    }
  }
}


// import chalk from "chalk";
// import { getStagedDiff, makeCommit } from "./git.js";
// import { generateCommitMessage } from "./ai.js";
// import { loadConfig } from "./config.js";
// import axios from "axios";

// // Function to validate API key
// async function validateApiKey(key) {
//   try {
//     await axios.get("https://api.openai.com/v1/models", {
//       headers: { Authorization: `Bearer ${key}` },
//     });
//     return true; // key is valid
//   } catch (err) {
//     if (err.response?.status === 401) return false; // invalid key
//     throw err;
//   }
// }

// export async function runCommit() {
//   const MAX_KEY_ATTEMPTS = 3;
//   let keyAttempts = 0;

//   // Load key first time (with validation)
//   await loadConfig(validateApiKey);

//   while (keyAttempts < MAX_KEY_ATTEMPTS) {
//     try {
//       console.log(chalk.cyan("🔍 Collecting staged changes..."));
//       const diff = await getStagedDiff();

//       if (!diff?.trim()) {
//         console.log(chalk.yellow("⚠️ No staged changes found."));
//         return;
//       }

//       console.log(chalk.cyan("🤖 Generating commit message..."));
//       const message = await generateCommitMessage(diff);

//       console.log(chalk.green("\n✨ Suggested Commit Message:\n"));
//       console.log(chalk.bold(message));

//       await makeCommit(message);
//       console.log(chalk.green("\n✅ Commit created successfully!"));
//       return; // success

//     } catch (err) {
//       if (err.message.includes("Invalid API key")) {
//         keyAttempts++;
//         console.log(chalk.red(`❌ Invalid API key. Attempts left: ${MAX_KEY_ATTEMPTS - keyAttempts}`));
//         process.env.OPENAI_API_KEY = null;

//         if (keyAttempts >= MAX_KEY_ATTEMPTS) {
//           console.log(chalk.red("❌ Maximum API key attempts reached. Exiting."));
//           return;
//         }

//         // Prompt for new key again with proper validation
//         await loadConfig(validateApiKey);
//       } else if (err.message.includes("Rate limit hit")) {
//         console.log(chalk.red("❌ Rate limit reached. Try again later."));
//         return;
//       } else {
//         console.error(chalk.red("❌ Error:"), err.message);
//         return;
//       }
//     }
//   }
// }
