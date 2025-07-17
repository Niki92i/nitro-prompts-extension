import OpenAI from "openai";
import { getCachedResponse, setCachedResponse, generateCacheKey } from "../cache/redis";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(text: string) {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(text, "summary");
    const cachedSummary = await getCachedResponse(cacheKey);
    
    if (cachedSummary) {
      return cachedSummary;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely and accurately.",
        },
        {
          role: "user",
          content: `Please summarize the following text in a clear and concise way:\n\n${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary = response.choices[0].message.content;
    
    // Cache the response
    if (summary) {
      await setCachedResponse(cacheKey, summary);
    }

    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}

export async function generateImage(prompt: string) {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(prompt, "image");
    const cachedImageUrl = await getCachedResponse(cacheKey);
    
    if (cachedImageUrl) {
      return cachedImageUrl;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    
    // Cache the response
    if (imageUrl) {
      await setCachedResponse(cacheKey, imageUrl);
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again later.");
  }
} 