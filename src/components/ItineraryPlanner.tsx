import React, { useState } from "react";
import { TravelForm } from "@/components/TravelForm";
import { useToast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define TravelPreferences type to match TravelForm's version
export interface TravelPreferences {
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  interests: string;
  days: number;
}

const apiKey = process.env.NEXT_PUBLIC_GEMENI_KEY;

if (!apiKey) {
  console.error("Error: GEMINI_KEY is not defined in the environment variables.");
  throw new Error("API key is missing. Check your .env.local configuration.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const ItineraryPlanner: React.FC = () => {
  const [itinerary, setItinerary] = useState<string | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchItinerary = async (preferences: TravelPreferences) => {
    try {
      setLoading(true);

      const prompt = `
        Generate a travel itinerary for a trip to ${preferences.destination}.
        - Duration: ${preferences.days} days
        - Interests: ${preferences.interests}
        - Budget: ${preferences.budget}
        Ensure the response is structured in JSON format.
      `;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      setItinerary(aiResponse);

      toast({
        title: "Itinerary Generated!",
        description: "Your personalized travel itinerary is ready.",
      });
    } catch (error) {
      console.error("Error fetching itinerary", error);
      toast({
        title: "Error",
        description: "There was an issue generating your itinerary. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="itinerary-planner">
      <TravelForm onSubmit={fetchItinerary} />
      
      {loading && (
        <div className="loading-box">
          <p>Loading your itinerary...</p>
        </div>
      )}

      {itinerary && (
        <div className="itinerary-box">
          <h2>Your Personalized Itinerary</h2>
          <pre className="itinerary-output">{itinerary}</pre>
        </div>
      )}
    </div>
  );
};
