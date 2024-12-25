import { useState } from "react";
import { TravelForm, TravelPreferences } from "@/components/TravelForm";
import { Itinerary, ItineraryDay } from "@/components/Itinerary";
import { useToast } from "@/components/ui/use-toast";
import { GlobeIcon, SparklesIcon } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_KEY;

// Add debug logging
console.log('Environment variables:', {
  VITE_GEMINI_KEY: import.meta.env.VITE_GEMINI_KEY,
  allEnv: import.meta.env
});

if (!API_KEY) {
  console.warn("Warning: GEMINI_KEY is not defined in environment variables. API calls will fail.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const Index = () => {
  const [itinerary, setItinerary] = useState<{
    destination: string;
    days: ItineraryDay[];
  } | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (preferences: TravelPreferences) => {
    setLoading(true);
    
    // Add validation check
    if (!preferences.days || preferences.days < 1) {
      toast({
        title: "Invalid Input",
        description: "Number of days must be at least 1",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const urlWithKey = `${API_URL}?key=${API_KEY}`;
      
      // Modify the prompt to be more explicit about JSON formatting
      const prompt = `
        Create a travel itinerary for ${preferences.destination} with the following details:
        - Duration: ${preferences.days} days
        - Interests: ${preferences.interests}
        - Budget: ${preferences.budget}

        Return ONLY a JSON object in this exact format without any additional text:
        {
          "destination": "${preferences.destination}",
          "days": [
            {
              "day": 1,
              "activities": [
                {
                  "time": "Morning",
                  "description": "Activity description",
                  "location": "Location name",
                  "cost": "Estimated cost"
                }
              ]
            }
          ]
        }`;

      const response = await fetch(urlWithKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Clean the response to ensure it only contains the JSON part
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}') + 1;
      const jsonString = aiResponse.slice(jsonStart, jsonEnd);

      try {
        const itineraryData = JSON.parse(jsonString);
        
        if (!itineraryData.destination || !Array.isArray(itineraryData.days)) {
          throw new Error('Invalid itinerary format received');
        }

        setItinerary({
          destination: itineraryData.destination,
          days: itineraryData.days,
        });

        toast({
          title: "Itinerary Generated!",
          description: `Explore the wonders of ${itineraryData.destination}. Your plan is ready!`,
        });
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.log('Raw response that failed to parse:', aiResponse);
        throw new Error('Failed to parse the generated itinerary. Please try again.');
      }

    } catch (error) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = () => {
    toast({
      title: "Coming Soon",
      description: "Itinerary customization will be available in the next update!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F0FB] to-white">
      <div className="container px-4 py-12 mx-auto">
        {!itinerary ? (
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-6 max-w-3xl">
              <div className="flex items-center justify-center gap-3 text-primary mb-8">
                <GlobeIcon className="w-8 h-8" />
                <SparklesIcon className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[#403E43] sm:text-6xl">
                Your Perfect Journey Awaits
              </h1>
              <p className="text-xl text-[#8E9196] max-w-2xl mx-auto leading-relaxed">
                Experience AI-powered travel planning with Gemini. Let us craft your ideal 
                itinerary while you focus on the excitement of discovery.
              </p>
            </div>
            <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#E2D1C3]/20">
              <TravelForm onSubmit={handleSubmit} />
              {loading && <p className="text-center mt-4 text-gray-500">Generating your itinerary...</p>}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Itinerary
              destination={itinerary.destination}
              days={itinerary.days}
              onCustomize={handleCustomize}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
