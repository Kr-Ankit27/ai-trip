import { MapPin, Users, Wallet, Sparkles, User, Briefcase } from "lucide-react";

export const SelectTravelersList = [
  {
    id: 1,
    title: "Just Me",
    desc: "Traveling alone for self-discovery or adventure.",
    people: "1",
    icon: <User className="w-10 h-10 text-indigo-500" />,
  },
  {
    id: 2,
    title: "Couple",
    value: "couple",
    desc: "Romantic getaway for two.",
    people: "2",
    icon: <Users className="w-10 h-10 text-pink-500" />,
  },
  {
    id: 3,
    title: "Family",
    value: "family",
    desc: "Fun-filled trip with family members.",
    people: "4 to 6",
    icon: <Users className="w-10 h-10 text-green-500" />,
  },
  {
    id: 4,
    title: "Friends",
    value: "friends",
    desc: "A bunch of thrill-seekers.",
    people: "5 to 10",
    icon: <Sparkles className="w-10 h-10 text-yellow-500" />,
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Low",
    desc: "Budget-friendly travel with essentials.",
    icon: <Wallet className="w-10 h-10 text-gray-500" />,
  },
  {
    id: 2,
    title: "Medium",
    desc: "Balanced comfort and affordability.",
    icon: <Wallet className="w-10 h-10 text-blue-500" />,
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Premium experiences and high-end stays.",
    icon: <Briefcase className="w-10 h-10 text-purple-500" />,
  },
];

// ✅ Example rendering with improved CSS
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
  {SelectBudgetOptions.map((item) => (
    <div
      key={item.id}
      className="flex flex-col items-center p-6 border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white"
    >
      <div className="mb-3">{item.icon}</div>
      <h2 className="font-semibold text-lg text-gray-800">{item.title}</h2>
      <p className="text-sm text-gray-500 text-center mt-1">{item.desc}</p>
    </div>
  ))}
</div>

export const AI_Prompt = "Generate travel plan for location: {location}, for {days} days for {travelers} with {budget} budget. Include best_time_to_visit, hotel options (name, address, pricing_per_night_approx with min and max, rating, image_url, description) and a detailed daily itinerary. The itinerary MUST be a nested structure: an array of day objects (day, title), where each day object contains a 'plan' array of objects (activity, description, image_url, ticket_pricing_approx, travel_time, and time_of_day). Return the data in a nested JSON structure with a 'best_time_to_visit' field and a 'travel_plan' object containing 'hotel_options' and 'itinerary' arrays."
