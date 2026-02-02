"use client"

import Image from "next/image"

// Card 1: Major
function MajorCard() {
  return (
    <div className="relative w-[240px] h-[160px]">
      <Image
        src="/cards/Major.svg"
        alt="Major card"
        width={240}
        height={160}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

// Card 2: Minor 1
function Minor1Card() {
  return (
    <div className="relative w-[240px] h-[160px]">
      <Image
        src="/cards/Minor 1.svg"
        alt="Minor 1 card"
        width={240}
        height={160}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

// Card 3: Minor 2
function Minor2Card() {
  return (
    <div className="relative w-[240px] h-[160px]">
      <Image
        src="/cards/Minor 2.svg"
        alt="Minor 2 card"
        width={240}
        height={160}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

// Card 4: Augmented
function AugmentedCard() {
  return (
    <div className="relative w-[240px] h-[160px]">
      <Image
        src="/cards/Augmented.svg"
        alt="Augmented card"
        width={240}
        height={160}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export default function CardSlots() {
  // Create 8 empty slots (2 columns x 4 rows)
  const slots = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="flex flex-row gap-12 w-full max-w-6xl">
      {/* Left side: Grid of empty slots */}
      <div className="flex-1 flex justify-center">
        <div className="grid grid-cols-2 gap-6 auto-rows-[160px]">
          {slots.map((slot) => (
            <div
              key={slot}
              className="relative w-[240px] h-[160px] rounded-[10px] border border-[#A2A2A2] bg-white shadow-sm transition-all hover:shadow-md"
            >
              {/* Empty slot - ready for cards */}
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Source cards (infinite supply) */}
      <div className="flex flex-col gap-4">
        <MajorCard />
        <Minor1Card />
        <Minor2Card />
        <AugmentedCard />
      </div>
    </div>
  )
}
