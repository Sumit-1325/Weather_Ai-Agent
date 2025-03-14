import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from "readline-sync";

dotenv.config({
    path: "./.env",
});

const genAI = new GoogleGenerativeAI(process.env.Gimini_API_KEY);

function GetWeatherData(city) {
    if (city.toLowerCase() === "new york") return "14°C";
    if (city.toLowerCase() === "tokyo") return "18°C";
    if (city.toLowerCase() === "paris") return "11°C";
    return null;
}

const Tools = {
    GetWeatherData: GetWeatherData,
};

const SYSTEM_PROMPT = `
    You are a helpful assistant that can answer questions about the weather in different cities. You will assist with START, PLAN, ACTION, OBSERVATION, and OUTPUT STATE MACHINE.
    Wait for a user prompt and first plan using available tools.
    After planning, take the action with appropriate tools and wait for observation based on action.
    Once you get the observations, return the AI response based on START prompt and observations.

    Available Tools:
    - function GetWeatherData(city: string): string
    GetWeatherData is a function that accepts a city name and returns the weather data for a given city.

    Strictly Follow the Json Format As given in the example

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
    Do not use markdown code blocks in your response.
`;

const messages = [{
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }],
}];

async function chatBot() {
    while (true) {
        const query = readlineSync.question(">> ");
        const q = { type: "user", user: query };
        messages.push({
            role: "user",
            parts: [{ text: JSON.stringify(q) }],
        });

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const result = await model.generateContent({ contents: messages });
        const response = await result.response.text();

        try {
            const jsonString = response.replace(/```(json)?\n/g, '').replace(/```/g, '');
            const call = JSON.parse(jsonString);

            messages.push({
                role: "assistant",
                parts: [{ text: JSON.stringify(call) }],
            });

            if (call.type === "output") {
                console.log(call.output);
                break;
            } else if (call.type === "action") {
                const tool = Tools[call.function];
                const observation = tool(call.input);
                const o = { type: "observation", observation: observation };
                messages.push({
                    role: "tool",
                    parts: [{ text: JSON.stringify(o) }],
                });
            }
        } catch (error) {
            console.error("Error parsing response:", error);
            console.log("Raw response:", response);
        }
    }
}

chatBot();