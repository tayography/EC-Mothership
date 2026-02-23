import React from "react";
import PageTransition from "../components/layout/PageTransition";
import { TrendingUp, MapPin, Users, Star, AlertCircle, Target, Check } from "lucide-react";
import { motion } from "framer-motion";
import SalesPitchAgent from "../components/warroom/SalesPitchAgent";

const statsCards = [
  {
    id: 1,
    title: "Customers are actively looking for local businesses online",
    stat: "80% of U.S. consumers search online for local businesses at least weekly and 32% do it daily.",
    pitch: "Even if you're 'referral-based,' people still Google you to confirm you're real.",
    icon: TrendingUp,
    color: "cyan"
  },
  {
    id: 2,
    title: "Local searches turn into real foot traffic and purchases (fast)",
    stat: "76% of people who search for something nearby on their smartphone visit a related business within a day, and 28% of those searches result in a purchase.",
    pitch: "When someone searches 'near me,' they're basically already in the car.",
    icon: MapPin,
    color: "emerald"
  },
  {
    id: 3,
    title: "Your competitors increasingly have websites",
    stat: "83% of small businesses have a website in 2025 (up from 65% in 2018).",
    pitch: "Not having a site isn't 'old school' anymore—it's giving your competitors a head start.",
    icon: Users,
    color: "amber"
  },
  {
    id: 4,
    title: "Reviews matter, but a website is where you control the story",
    stat: "69% of consumers feel positive about using a business if written reviews describe positive experiences.",
    pitch: "Google reviews are the social proof… the website is the closing argument.",
    icon: Star,
    color: "violet"
  },
  {
    id: 5,
    title: "Bad digital experience loses customers (even if your service is great)",
    stat: "52% of consumers stopped buying from a brand because of a bad experience.",
    pitch: "Your website is often the first 'experience' people have with your business.",
    icon: AlertCircle,
    color: "red"
  }
];

const mustHaves = [
  {
    title: "Trust + legitimacy",
    items: ["photos", "reviews", "FAQs", "licensing/insurance", '"about"', "real address"]
  },
  {
    title: "Conversion",
    items: ["click-to-call", "quote form", "service-area pages", "pricing ranges", "financing if relevant"]
  },
  {
    title: "Local search support",
    items: ["service + city pages", "fast mobile", "clear NAP", "embedded map"]
  }
];

const colorClasses = {
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-900",
    icon: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400",
    text: "text-cyan-600 dark:text-cyan-400"
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900",
    icon: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400"
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900",
    icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400"
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-900",
    icon: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400"
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-900",
    icon: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    text: "text-red-600 dark:text-red-400"
  }
};

export default function WarRoom() {
  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">War Room</h1>
        <p className="text-sm text-zinc-400 mt-1">Sales pitch reference cards with data-backed talking points</p>
      </div>

      {/* AI Sales Pitch Assistant */}
      <SalesPitchAgent />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const colors = colorClasses[card.color];
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${colors.bg} border ${colors.border} rounded-2xl p-6`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`${colors.icon} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${colors.text} mb-1`}>#{card.id}</div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {card.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1.5 font-medium">STAT</div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {card.stat}
                  </p>
                </div>

                <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1.5 font-medium">PITCH LINE</div>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium italic leading-relaxed">
                    "{card.pitch}"
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Pitch Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-900 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data-Backed Pitch (Word-for-Word)</h2>
        </div>

        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 border border-cyan-200/50 dark:border-cyan-800">
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            "Most people don't choose a local company in the dark anymore. <span className="font-semibold text-zinc-900 dark:text-zinc-100">80% of consumers search online for local businesses every week</span> and a third do it daily.
          </p>
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            And when someone searches on mobile for something nearby, Google found <span className="font-semibold text-zinc-900 dark:text-zinc-100">76% visit within a day and 28% buy</span>.
          </p>
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            So the question isn't 'Do you need a website?' It's: <span className="font-semibold text-zinc-900 dark:text-zinc-100">what happens when they look you up?</span> A solid site lets you control the message, show proof, and turn searches into calls."
          </p>
        </div>
      </motion.div>

      {/* Must-Haves Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3 Must-Have Website Points (Tied to Revenue)</h2>
          <p className="text-sm text-zinc-400 mt-1">Essential elements that directly impact conversion</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {mustHaves.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</h3>
              </div>

              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </PageTransition>
  );
}