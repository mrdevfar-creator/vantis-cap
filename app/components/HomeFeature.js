"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const artworks = [
  {
    image:
      "https://cdn.rareblocks.xyz/collection/clarity-ecommerce/images/hero/2/artwork-1.png",
    title: "Ely-The Angry Girl",
    eth: "2.00 ETH",
    usd: "($9,394)",
  },
  {
    image:
      "https://cdn.rareblocks.xyz/collection/clarity-ecommerce/images/hero/2/artwork-2.png",
    title: "Jenny-Retro Art",
    eth: "1.67 ETH",
    usd: "($7,627)",
  },
  {
    image:
      "https://cdn.rareblocks.xyz/collection/clarity-ecommerce/images/hero/2/artwork-3.png",
    title: "Naila-The Angry Girl",
    eth: "2.40 ETH",
    usd: null,
  },
];

export default function HomeFeature() {
  return (
    <section>
      {/* Header */}

      {/* Hero */}
      <div className="relative py-12 overflow-hidden bg-gray-100 sm:py-16 lg:py-20 xl:py-24">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col">
            {/* Text */}
            <div className="max-w-md mx-auto text-center xl:max-w-lg lg:mx-0 lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:leading-tight xl:text-6xl">
                Collect rare ✨ digital artworks
              </h1>
              <p className="mt-5 text-lg font-medium text-gray-900 lg:mt-8">
                Buy &amp; sell NFTs from world&apos;s top artist
              </p>

              <div className="mt-8 lg:mt-10">
                <Link
                  href="#"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-600"
                  role="button"
                >
                  Explore all artwork
                </Link>
              </div>

              <div className="mt-8 lg:mt-12">
                <svg
                  className="w-auto h-4 mx-auto text-gray-300 lg:mx-0"
                  viewBox="0 0 172 16"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 11 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 46 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 81 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 116 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 151 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 18 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 53 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 88 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 123 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 158 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 25 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 60 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 95 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 130 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 165 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 32 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 67 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 102 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 137 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 172 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 39 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 74 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 109 1)"
                  />
                  <line
                    y1="-0.5"
                    x2="18.0278"
                    y2="-0.5"
                    transform="matrix(-0.5547 0.83205 0.83205 0.5547 144 1)"
                  />
                </svg>
              </div>

              <div className="inline-grid grid-cols-2 mt-8 gap-x-8">
                <div>
                  <p className="text-4xl font-bold text-gray-900">50k+</p>
                  <p className="mt-2 text-base font-medium text-gray-500">
                    Artwork
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-900">17k+</p>
                  <p className="mt-2 text-base font-medium text-gray-500">
                    Artists
                  </p>
                </div>
              </div>
            </div>

            {/* Artwork Cards */}
            <div className="relative mt-12 lg:mt-0 lg:absolute lg:-translate-y-1/2 lg:translate-x-1/2 lg:top-1/2">
              <div className="relative w-full overflow-auto">
                <div className="flex gap-8 flex-nowrap">
                  {artworks.map((art, index) => (
                    <div
                      key={index}
                      className="flex-none w-full sm:w-2/3 lg:w-full lg:flex-1 whitespace-nowrap"
                    >
                      <div className="overflow-hidden bg-white rounded shadow-xl">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={art.image}
                            alt={art.title}
                            fill
                            quality={100}
                            className="object-cover"
                          />
                        </div>
                        <div className="p-8">
                          <p className="text-lg font-bold text-gray-900">
                            {art.title}
                          </p>
                          <p className="mt-6 text-xs font-medium tracking-widest text-gray-500 uppercase">
                            Reserved Price
                          </p>
                          <div className="flex items-end mt-1">
                            <p className="text-lg font-bold text-gray-900">
                              {art.eth}
                            </p>
                            {art.usd && (
                              <p className="ml-2 text-sm font-medium text-gray-500">
                                {art.usd}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 mt-7 gap-x-4">
                            <Link
                              href="#"
                              className="inline-flex items-center justify-center px-4 py-4 text-sm font-bold text-white transition-all duration-200 bg-gray-900 border border-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700"
                              role="button"
                            >
                              Place a bid
                            </Link>
                            <Link
                              href="#"
                              className="inline-flex items-center justify-center px-4 py-4 text-sm font-bold text-gray-900 transition-all duration-200 bg-transparent border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                              role="button"
                            >
                              View artwork
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
