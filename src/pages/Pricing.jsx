import React from "react";
import { Check } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const pricingOptions = [
    {
      name: "Landing Page Development",
      description: "Professional landing page development and deployment",
      price: "$1,000",
      period: "one-time",
      features: [
        "Custom design",
        "Responsive layout",
        "SEO optimized",
        "Deployment included",
        "30-day support",
      ],
    },
    {
      name: "Website Hosting",
      description: "Reliable hosting for your website",
      price: "$500",
      period: "per year (paid upfront)",
      alternatePrice: "$50/month ($600/year)",
      features: [
        "99.9% uptime guarantee",
        "SSL certificate included",
        "Daily backups",
        "CDN integration",
        "24/7 monitoring",
      ],
    },
    {
      name: "Website Maintenance",
      description: "Keep your website fresh and up-to-date",
      price: "$400",
      period: "per month",
      features: [
        "1 update per week",
        "Menu updates",
        "Weekly sales/promotions",
        "Content changes",
        "Priority support",
        "Security updates",
      ],
    },
  ];

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pricing</h1>
        <p className="text-sm text-zinc-400 mt-1">Choose the perfect plan for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingOptions.map((option) => (
          <div
            key={option.name}
            className="bg-white border border-zinc-200/60 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{option.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{option.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900">{option.price}</span>
                <span className="text-sm text-zinc-500">{option.period}</span>
              </div>
              {option.alternatePrice && (
                <p className="text-xs text-zinc-400 mt-1">or {option.alternatePrice}</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {option.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-zinc-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 rounded-xl">
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}