import axios from "axios";
import { loadConfig } from "./config.js";

export async function generateCommitMessage(diff) {
  const { apiKey } = await loadConfig();

  const prompt = `Generate a concise git commit message for this diff:\n\n${diff}`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 60,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();

  } catch (err) {
    if (err.response?.status === 401) {
      throw new Error("Invalid API key");
    } else if (err.response?.status === 429) {
      throw err; // will handle in CLI
    } else {
      throw err;
    }
  }
}



// import axios from "axios";

// /**
//  * Generate commit message with retry on 429
//  */
// export async function generateCommitMessage(diff) {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) throw new Error("Missing API key");

//   const prompt = `Generate a concise git commit message for this diff:\n\n${diff}`;

//   let retries = 5;
//   let delay = 2000;

//   while (retries > 0) {
//     try {
//       const response = await axios.post(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           model: "gpt-4o-mini",
//           messages: [{ role: "user", content: prompt }],
//           max_tokens: 60,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${apiKey}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       return response.data.choices[0].message.content.trim();

//     } catch (err) {
//       if (err.response?.status === 429 && retries > 1) {
//         console.warn(`⚠️ Rate limited, retrying in ${delay/1000}s...`);
//         await new Promise(r => setTimeout(r, delay));
//         retries--;
//         delay *= 2;
//       } else if (err.response?.status === 429) {
//         throw new Error("Rate limit hit (429). Try again later.");
//       } else if (err.response?.status === 401) {
//         throw new Error("Invalid API key (401)");
//       } else {
//         throw err;
//       }
//     }
//   }
// }
