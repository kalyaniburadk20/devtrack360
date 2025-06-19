const OpenAI = require('openai');

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends a simple text prompt to the OpenAI GPT-3.5-turbo model
 * and returns the model's response.
 * @param {string} prompt The text prompt to send to the LLM.
 * @returns {Promise<string|null>} The LLM's response content, or null if an error occurs.
 */
async function getSimpleCompletion(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Please add it to your .env file.");
    return null;
  }
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4o" for a more advanced model (costs more)
      messages: [{ role: "user", content: prompt }],
    });
    // Extract the content from the first choice's message
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error.message);
    // Log more details if it's an OpenAI API error
    if (error.response) {
      console.error("OpenAI API response status:", error.response.status);
      console.error("OpenAI API response data:", error.response.data);
    }
    return null;
  }
}

module.exports = { getSimpleCompletion };
