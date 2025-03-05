// index.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from "readline-sync";

dotenv.config({
    path: "./.env",
});

const genAI = new GoogleGenerativeAI(process.env.Gimini_API_KEY);

function GetWeatherData(city) { 
    if (city.toLowerCase() === "new york") return '14°C';
    if (city.toLowerCase() === "tokyo") return '18°C';
    if (city.toLowerCase() === "paris") return '11°C';
}



const SYSTEM_PROMPT = `
    You are a helpful assistant that can answer questions about the weather in different cities. You will assist with START, PLAN, ACTION, OBSERVATION, and OUTPUT STATE MACHINE.
    Wait for a user prompt and first plan using available tools.
    After planning, take the action with appropriate tools and wait for observation based on action.
    Once you get the observations, return the AI response based on START prompt and observations.

    Available Tools:
    - function GetWeatherData(city: string): string
    GetWeatherData is a function that accepts a city name and returns the weather data for a given city.

    Example:
    START:
    {"type": "user", "user": "what is the weather in new york?"}
    {"type": "plan", "plan": "search for GetWeatherData for new york"}
    {"type": "action", "function": "GetWeatherData", "input": "new york"}
    {"type": "observation", "observation": "14°C"}
    {"type": "plan", "plan": "search for GetWeatherData for tokyo"}
    {"type": "action", "function": "GetWeatherData", "input": "tokyo"}
    {"type": "observation", "observation": "18°C"}
    {"type": "output", "output": "the sum of new york and tokyo is 32°C"}
`;

const messages = [{
    role: "system",
    content : SYSTEM_PROMPT
}];

   while (true) {
    const query = readlineSync.question(">> ");
    const q = { type: "user", user: query };
    messages.prompt 
}