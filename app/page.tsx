import PianoKeyboard from "@/components/piano-keyboard"
import CardSlots from "@/components/card-slots"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-end bg-neutral-100 p-8 gap-8">
      <h1 className="text-4xl font-bold text-muted-foreground text-heading mb-4 self-center tracking-widest">
        Scale Master
      </h1>
      <CardSlots />
      <PianoKeyboard />
    </main>
  )
}
