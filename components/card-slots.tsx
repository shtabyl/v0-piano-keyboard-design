"use client"

import { useState } from "react"
import Image from "next/image"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

type CardType = "major" | "minor1" | "minor2" | "augmented"

interface SlotCard {
  id: string
  type: CardType
}

// Card component that can be rendered in slots or as source
function Card({ type, id }: { type: CardType; id?: string }) {
  const cardSources: Record<CardType, string> = {
    major: "/cards/Major.svg",
    minor1: "/cards/Minor 1.svg",
    minor2: "/cards/Minor 2.svg",
    augmented: "/cards/Augmented.svg",
  }

  const cardAlt: Record<CardType, string> = {
    major: "Major card",
    minor1: "Minor 1 card",
    minor2: "Minor 2 card",
    augmented: "Augmented card",
  }

  return (
    <div className="relative w-[240px] h-[160px]">
      <Image
        src={cardSources[type]}
        alt={cardAlt[type]}
        width={240}
        height={160}
        className="w-full h-full object-contain"
      />
    </div>
  )
}

// Draggable source card component
function DraggableSourceCard({ type, id }: { type: CardType; id: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type: "source",
      cardType: type,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card type={type} />
    </div>
  )
}

// Draggable card in slot component
function DraggableSlotCard({ card, slotId }: { card: SlotCard; slotId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: slotId,
    data: {
      type: "slot-card",
      card,
      slotId,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="w-full h-full">
      <Card type={card.type} id={card.id} />
    </div>
  )
}

// Droppable slot component
function DroppableSlot({
  slotId,
  card,
  rowIndex,
  slotIndex,
}: {
  slotId: string
  card: SlotCard | null
  rowIndex: number
  slotIndex: number
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    data: {
      type: "slot",
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`relative w-[240px] h-[160px] rounded-[10px] border ${
        isOver
          ? "border-blue-500 border-2 bg-blue-50"
          : "border-[#A2A2A2] bg-white"
      } shadow-sm transition-all hover:shadow-md`}
    >
      {card ? (
        <DraggableSlotCard card={card} slotId={slotId} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
          {/* Empty slot */}
        </div>
      )}
    </div>
  )
}

export default function CardSlots() {
  // Create 4 rows, each with 2 slots (8 slots total)
  const rows = Array.from({ length: 4 }, (_, i) => i)
  const slotsPerRow = 2

  // State to track cards in each slot
  const [slotCards, setSlotCards] = useState<Record<string, SlotCard | null>>({})
  const [activeId, setActiveId] = useState<string | null>(null)

  // Generate slot IDs
  const getSlotId = (rowIndex: number, slotIndex: number) => `slot-${rowIndex}-${slotIndex}`

  // Source card IDs
  const sourceCards = [
    { id: "source-major", type: "major" as CardType },
    { id: "source-minor1", type: "minor1" as CardType },
    { id: "source-minor2", type: "minor2" as CardType },
    { id: "source-augmented", type: "augmented" as CardType },
  ]

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeData = active.data.current
    const overId = over.id as string

    // Check if dropping on a slot
    if (overId.startsWith("slot-")) {
      // If dragging from source, clone the card
      if (activeData?.type === "source" && activeData?.cardType) {
        const newCardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newCard: SlotCard = {
          id: newCardId,
          type: activeData.cardType,
        }

        setSlotCards((prev) => ({
          ...prev,
          [overId]: newCard,
        }))
      }
      // If dragging from another slot, move the card
      else if (activeData?.type === "slot-card" && activeData?.card) {
        const sourceSlotId = activeData.slotId as string
        const card = activeData.card as SlotCard

        // Don't do anything if dropping on the same slot
        if (sourceSlotId !== overId) {
          setSlotCards((prev) => {
            const updated = { ...prev }
            // Remove from source slot
            updated[sourceSlotId] = null
            // Add to target slot (replacing if exists)
            updated[overId] = card
            return updated
          })
        }
      }
    }

    setActiveId(null)
  }

  // Get active card type for drag overlay
  const getActiveCardType = (): CardType | null => {
    if (!activeId) return null

    // Check if it's a source card
    const sourceCard = sourceCards.find((c) => c.id === activeId)
    if (sourceCard) return sourceCard.type

    // Check if it's a card in a slot (activeId is the slotId when dragging from slot)
    const slotCard = slotCards[activeId]
    if (slotCard) return slotCard.type

    return null
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-row gap-12 w-full max-w-6xl">
        {/* Left side: Grid of empty slots with tone connectors */}
        <div className="flex-1 flex flex-col gap-6">
          {rows.map((rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-center gap-[5px]">
              {/* First slot */}
              <DroppableSlot
                slotId={getSlotId(rowIndex, 0)}
                card={slotCards[getSlotId(rowIndex, 0)] || null}
                rowIndex={rowIndex}
                slotIndex={0}
              />
              {/* Tone connector */}
              <div className="relative w-[52px] h-[52px] flex-shrink-0">
                <Image
                  src="/cards/Tone-connector.svg"
                  alt="Tone connector"
                  width={52}
                  height={52}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Second slot */}
              <DroppableSlot
                slotId={getSlotId(rowIndex, 1)}
                card={slotCards[getSlotId(rowIndex, 1)] || null}
                rowIndex={rowIndex}
                slotIndex={1}
              />
            </div>
          ))}
        </div>

        {/* Right side: Source cards (infinite supply) */}
        <div className="flex flex-col gap-4">
          {sourceCards.map(({ id, type }) => (
            <DraggableSourceCard key={id} id={id} type={type} />
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId && getActiveCardType() ? (
          <div className="opacity-90">
            <Card type={getActiveCardType()!} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
