import { GoogleGenAI } from "@google/genai";

// Use public environment API key by default, but allow user override
function getAiClient(userKey?: string) {
  const apiKey = userKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Dodaj w ustawieniach albo użyj domyślnego w AI Studio.");
  return new GoogleGenAI({ apiKey });
}

export async function detectIngredients(text: string, apiKey: string) {
  const ai = getAiClient(apiKey);
  const prompt = `Przeanalizuj poniższy tekst przepisu. Zwróć TYLKO wynik w formacie JSON zawierający odpowiednio pola:
- "name": nazwa przypisu, jak potrawa się nazywa
- "ingredients": tablica z nazwami głównych składników po polsku, bez ilości i jednostek (np. ["owsianka", "banan"]). Pomiń sól, pieprz, wodę i olej.
- "instructions": krótka, prosta instrukcja przygotowania krok po kroku (max 3-4 zdania).
- "tags": tablica z jedną lub dwiema etykietami. Zawsze daj ocenę czy danie jest "Słodkie" czy "Słone".

Tekst:
${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.1, responseMimeType: "application/json" }
  });

  const result = JSON.parse(response.text || "{}");
  return {
    name: result.name || "",
    ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
    instructions: result.instructions || "",
    tags: Array.isArray(result.tags) ? result.tags : []
  };
}

export async function findSubstitute(item: string, recipeName: string, inHome: string[], apiKey: string) {
  const ai = getAiClient(apiKey);
  const prompt = `Chcę zrobić "${recipeName}", ale brakuje mi: "${item}". W spiżarni mam: ${inHome.length ? inHome.join(', ') : 'pusto'}. Podaj mi JEDNO krótkie zdanie, czym to zastąpić z domowych zapasów. Bez formatowania markdown.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.3 }
  });
  
  return response.text || "Brak zamiennika.";
}

export async function generateMagicRecipe(inHome: string[], apiKey: string) {
  const ai = getAiClient(apiKey);
  const prompt = `Jesteś kreatywnym kucharzem. Wymyśl szybkie śniadanie TYLKO (lub głównie) z tych składników: ${inHome.join(', ')}. 
  Zwróć TYLKO JSON: {"name": "Nazwa", "tags": ["Słodkie"], "ingredients": ["składnik1", "składnik2"], "instructions": "Krótka instrukcja przygotowania."}. Wymagane aby w tags znalazło się "Słodkie" albo "Słone".`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.7, responseMimeType: "application/json" }
  });
  
  return JSON.parse(response.text || "{}");
}

export async function processVoiceCommand(transcript: string, knownItems: string[], apiKey: string) {
  const ai = getAiClient(apiKey);
  const prompt = `Użytkownik modyfikuje spiżarnię poleceniem: "${transcript}". Znane produkty to: ${knownItems.join(', ')}. Zwróć JSON z podstawowymi formami słów (np. jajka, mleko): {"add":["produkt1"],"remove":["produkt2"]}. Zwróć TYLKO czysty JSON.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.1, responseMimeType: "application/json" }
  });
  
  return JSON.parse(response.text || `{"add":[], "remove":[]}`) as { add?: string[], remove?: string[] };
}
