import React from "react";

export type ItineraryDay = {
  day: number;
  activities: {
    time: string;
    activity: string;
    location: string;
    cost: string;
  }[];
};

export const Itinerary: React.FC<{
  destination: string;
  days: ItineraryDay[];
  onCustomize: () => void;
}> = ({ destination, days, onCustomize }) => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Itinerary for {destination}</h2>
      {days.map((day) => (
        <div key={day.day} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Day {day.day}</h3>
          <ul className="space-y-2">
            {day.activities.map((activity, index) => (
              <li key={index} className="text-gray-700">
                <strong>{activity.time}:</strong> {activity.activity} at{" "}
                <span className="italic">{activity.location}</span> - {activity.cost}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button
        onClick={onCustomize}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Customize
      </button>
    </div>
  );
};

export default Itinerary; // Optional, for default export
