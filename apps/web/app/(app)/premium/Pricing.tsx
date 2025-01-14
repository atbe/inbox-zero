"use client";

import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { env } from "@/env.mjs";
import { LoadingContent } from "@/components/LoadingContent";
import { usePremium } from "@/components/PremiumAlert";

const frequencies = [
  { value: "monthly" as const, label: "Monthly", priceSuffix: "/month" },
  { value: "annually" as const, label: "Annually", priceSuffix: "/year" },
];

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/welcome",
    price: { monthly: "$0", annually: "$0" },
    description: "Our generous free plan that covers all the basics.",
    features: [
      "Newsletter clean up",
      "Email analytics",
      "New senders",
      "Inbox",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: env.NEXT_PUBLIC_PRO_PAYMENT_LINK,
    checkout: true,
    price: { monthly: "$8", annually: "$80" },
    description:
      "Automate your email with AI assistance and advanced analytics.",
    features: [
      "Everything in free",
      "AI automations",
      "AI automated responses",
      "AI planning mode",
      "AI categorization",
      "Detailed analytics",
      "Priority support",
    ],
    cta: "Upgrade",
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: env.NEXT_PUBLIC_CALL_LINK,
    price: { monthly: "Book a call", annually: "Book a call" },
    description:
      "Self-host on your own servers to ensure complete data privacy. We'll help you set everything up.",
    features: ["Self-hosted", "Everything in pro", "Priority support"],
    hideFrequency: true,
    cta: "Book a call",
  },
];

export function Pricing() {
  const { isPremium, data, isLoading, error } = usePremium();

  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <LoadingContent loading={isLoading} error={error}>
      <div
        id="pricing"
        className="relative isolate mx-auto max-w-7xl bg-white px-6 pb-32 pt-10 lg:px-8"
      >
        {/* <div
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
        aria-hidden="true"
      >
        <div
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div> */}
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <h2 className="font-cal text-base leading-7 text-blue-600">
            Pricing
          </h2>
          <p className="mt-2 font-cal text-4xl text-gray-900 sm:text-5xl">
            Generous free tier, affordable paid plans
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Automate your email with AI assistance and advanced analytics.
        </p>

        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
          >
            <RadioGroup.Label className="sr-only">
              Payment frequency
            </RadioGroup.Label>
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  clsx(
                    checked ? "bg-black text-white" : "text-gray-500",
                    "cursor-pointer rounded-full px-2.5 py-1",
                  )
                }
              >
                <span>{option.label}</span>
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={clsx(
                tier.mostPopular ? "lg:z-10 lg:rounded-b-none" : "lg:mt-8",
                tierIdx === 0 ? "lg:rounded-r-none" : "",
                tierIdx === tiers.length - 1 ? "lg:rounded-l-none" : "",
                "flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={clsx(
                      tier.mostPopular ? "text-blue-600" : "text-gray-900",
                      "font-cal text-lg leading-8",
                    )}
                  >
                    {tier.name}
                  </h3>
                  {tier.mostPopular ? (
                    <p className="rounded-full bg-blue-600/10 px-2.5 py-1 font-cal text-xs leading-5 text-blue-600">
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.price[frequency.value]}
                  </span>
                  {!tier.hideFrequency && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /month
                    </span>
                  )}
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-blue-600"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={
                  tier.checkout && data?.id
                    ? `${tier.href}?checkout[custom][user_id]=${data.id}`
                    : tier.href
                }
                target={tier.href.startsWith("http") ? "_blank" : undefined}
                aria-describedby={tier.id}
                className={clsx(
                  tier.mostPopular
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                    : "text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300",
                  "mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                )}
              >
                {tier.id === "tier-pro" && isPremium
                  ? "Current plan"
                  : tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </LoadingContent>
  );
}
