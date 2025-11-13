// ✅ Import Heroicons
import {
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export const SelectTravelersList = [
  {
    id: 1,
    title: "Just Me",
    desc: "Traveling alone for self-discovery or adventure.",
    people: "1",
    icon: <UserIcon className="w-10 h-10 text-indigo-500" />,
  },
  {
    id: 2,
    title: "Couple",
    value: "couple",
    desc: "Romantic getaway for two.",
    people: "2",
    icon:<UsersIcon className="w-10 h-10 text-green-500" /> ,
  },
  {
    id: 3,
    title: "Family",
    value: "family",
    desc: "Fun-filled trip with family members.",
    people: "4 to 6",
    icon: <UserGroupIcon className="w-10 h-10 text-pink-500" />,
  },
  {
    id: 4,
    title: "Friends",
    value: "friends",
    desc: "A bunch of thrill-seekes.",
    people: "5 to 10",
    icon: <SparklesIcon className="w-10 h-10 text-yellow-500" />,
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Low",
    desc: "Budget-friendly travel with essentials.",
    icon: <CurrencyDollarIcon className="w-10 h-10 text-green-500" />,
  },
  {
    id: 2,
    title: "Medium",
    desc: "Balanced comfort and affordability.",
    icon: <AdjustmentsHorizontalIcon className="w-10 h-10 text-blue-500" />,
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Premium experiences and high-end stays.",
    icon: <StarIcon className="w-10 h-10 text-yellow-500" />,
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

export const AI_Prompt="Genarate travel plan for location : {location}, for {days} days for {travelers} with {budget} budget , give me hotel options and hotel names with address and pricing and rating and hotel image url ,description and suggest itineary with details , place image url ,ticket pricing , time to travel each for location with each day plan with best time to visit the place {location} in JSON format"
