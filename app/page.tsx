import PianoKeyboard from "@/components/piano-keyboard"
import CardSlots from "@/components/card-slots"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-end bg-neutral-100 p-8 gap-8">
      <CardSlots />
      <PianoKeyboard />
    </main>
  )
}
