"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import * as Tone from "tone"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface KeyProps {
  note: string
  isBlack?: boolean
  isPressed: boolean
  highlightColor?: string
  onPress: (note: string) => void
  onRelease: (note: string) => void
}

function PianoKey({ note, isBlack = false, isPressed, highlightColor, onPress, onRelease }: KeyProps) {
  const handleMouseDown = () => onPress(note)
  const handleMouseUp = () => onRelease(note)
  const handleMouseLeave = () => {
    if (isPressed) onRelease(note)
  }

  if (isBlack) {
    return (
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={highlightColor ? { backgroundColor: highlightColor } : undefined}
        className={`absolute z-10 w-7 -ml-3.5 rounded-b-[3px] transition-colors duration-75 border border-piano-border h-[150px] ${
          highlightColor
            ? ""
            : isPressed
              ? "bg-piano-black-key-pressed"
              : "bg-piano-black-key hover:bg-piano-black-key-pressed"
        }`}
        aria-label={`Piano key ${note}`}
      />
    )
  }

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      style={highlightColor ? { backgroundColor: highlightColor } : undefined}
      className={`relative w-10 border-l border-piano-border first:border-l-0 rounded-b-[3px] transition-colors duration-75 h-60 mx-px ${
        highlightColor
          ? ""
          : isPressed
            ? "bg-piano-white-key-pressed"
            : "bg-piano-white-key hover:bg-piano-white-key-pressed"
      }`}
      aria-label={`Piano key ${note}`}
    />
  )
}

const OCTAVE_PATTERN = [
  { note: "C", hasBlack: true },
  { note: "D", hasBlack: true },
  { note: "E", hasBlack: false },
  { note: "F", hasBlack: true },
  { note: "G", hasBlack: true },
  { note: "A", hasBlack: true },
  { note: "B", hasBlack: false },
]

const KEYBOARD_MAP: Record<string, string> = {
  z: "C3",
  s: "C#3",
  x: "D3",
  d: "D#3",
  c: "E3",
  v: "F3",
  g: "F#3",
  b: "G3",
  h: "G#3",
  n: "A3",
  j: "A#3",
  m: "B3",
  q: "C4",
  "2": "C#4",
  w: "D4",
  "3": "D#4",
  e: "E4",
  r: "F4",
  "5": "F#4",
  t: "G4",
  "6": "G#4",
  y: "A4",
  "7": "A#4",
  u: "B4",
  i: "C5",
  "9": "C#5",
  o: "D5",
  "0": "D#5",
  p: "E5",
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

function midiNoteToNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
]

export default function PianoKeyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [highlightedKeys, setHighlightedKeys] = useState<Record<string, string>>({})
  const [midiHighlightedKeys, setMidiHighlightedKeys] = useState<Record<string, string>>({})
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[4])
  const [isReady, setIsReady] = useState(false)
  const [midiStatus, setMidiStatus] = useState<"disconnected" | "connecting" | "connected" | "unsupported">("disconnected")
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const samplerRef = useRef<Tone.Sampler | null>(null)
  const midiAccessRef = useRef<MIDIAccess | null>(null)
  const selectedColorRef = useRef(selectedColor)

  // Keep ref in sync with state for MIDI callbacks
  useEffect(() => {
    selectedColorRef.current = selectedColor
  }, [selectedColor])

  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsReady(true)
      },
    }).toDestination()

    samplerRef.current = sampler

    return () => {
      sampler.dispose()
    }
  }, [])

  const playNote = useCallback((note: string) => {
    if (samplerRef.current && isReady && !isMuted) {
      Tone.start()
      samplerRef.current.triggerAttack(note)
    }
  }, [isReady, isMuted])

  const releaseNote = useCallback((note: string) => {
    if (samplerRef.current && isReady) {
      samplerRef.current.triggerRelease(note)
    }
  }, [isReady])

  const toggleHighlight = useCallback((note: string) => {
    setHighlightedKeys((prev) => {
      const next = { ...prev }
      if (next[note]) {
        delete next[note]
      } else {
        next[note] = selectedColor
      }
      return next
    })
  }, [selectedColor])

  // MIDI note handlers - highlight on press, unhighlight on release
  const handleMidiNoteOn = useCallback((note: string) => {
    setPressedKeys((prev) => new Set(prev).add(note))
    playNote(note)
    setMidiHighlightedKeys((prev) => ({
      ...prev,
      [note]: selectedColorRef.current,
    }))
  }, [playNote])

  const handleMidiNoteOff = useCallback((note: string) => {
    setPressedKeys((prev) => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
    releaseNote(note)
    setMidiHighlightedKeys((prev) => {
      const next = { ...prev }
      delete next[note]
      return next
    })
  }, [releaseNote])

  // Mouse/keyboard handlers - toggle highlight
  const handleKeyPress = useCallback(
    (note: string) => {
      setPressedKeys((prev) => new Set(prev).add(note))
      playNote(note)
      toggleHighlight(note)
    },
    [playNote, toggleHighlight]
  )

  const handleKeyRelease = useCallback((note: string) => {
    setPressedKeys((prev) => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
    releaseNote(note)
  }, [releaseNote])

  const clearAllHighlights = useCallback(() => {
    setHighlightedKeys({})
    setMidiHighlightedKeys({})
  }, [])

  // MIDI setup and handling
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setMidiStatus("unsupported")
      return
    }

    setMidiStatus("connecting")

    const handleMidiMessage = (event: MIDIMessageEvent) => {
      const [status, midiNote, velocity] = event.data as Uint8Array
      const command = status & 0xf0

      // Note on: 0x90, Note off: 0x80
      if (command === 0x90 && velocity > 0) {
        const noteName = midiNoteToNoteName(midiNote)
        handleMidiNoteOn(noteName)
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        const noteName = midiNoteToNoteName(midiNote)
        handleMidiNoteOff(noteName)
      }
    }

    const connectInputs = (midiAccess: MIDIAccess) => {
      // Disconnect all existing listeners first
      midiAccess.inputs.forEach((input) => {
        input.onmidimessage = null
      })

      // Connect to all available inputs
      let connectedDevice: string | null = null
      midiAccess.inputs.forEach((input) => {
        input.onmidimessage = handleMidiMessage
        if (!connectedDevice && input.name) {
          connectedDevice = input.name
        }
      })

      if (midiAccess.inputs.size > 0) {
        setMidiStatus("connected")
        setMidiDeviceName(connectedDevice)
      } else {
        setMidiStatus("disconnected")
        setMidiDeviceName(null)
      }
    }

    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        midiAccessRef.current = midiAccess

        // Connect to existing inputs
        connectInputs(midiAccess)

        // Handle device connection/disconnection
        midiAccess.onstatechange = () => {
          connectInputs(midiAccess)
        }
      },
      () => {
        setMidiStatus("unsupported")
      }
    )

    return () => {
      if (midiAccessRef.current) {
        midiAccessRef.current.inputs.forEach((input) => {
          input.onmidimessage = null
        })
      }
    }
  }, [handleMidiNoteOn, handleMidiNoteOff])

  // Computer keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const note = KEYBOARD_MAP[e.key.toLowerCase()]
      if (note && !pressedKeys.has(note)) {
        handleKeyPress(note)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEYBOARD_MAP[e.key.toLowerCase()]
      if (note) {
        handleKeyRelease(note)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyPress, handleKeyRelease, pressedKeys])

  // Generate all keys in order for range calculation
  const allKeysInOrder = useMemo(() => {
    const keys: string[] = []
    for (const octave of [3, 4, 5]) {
      for (const { note, hasBlack } of OCTAVE_PATTERN) {
        keys.push(`${note}${octave}`)
        if (hasBlack) {
          keys.push(`${note}#${octave}`)
        }
      }
    }
    return keys
  }, [])

  // Calculate which keys should be gray (in-between unselected keys)
  const inBetweenKeys = useMemo(() => {
    const allSelectedKeys = new Set([
      ...Object.keys(highlightedKeys),
      ...Object.keys(midiHighlightedKeys),
    ])

    if (allSelectedKeys.size < 2) {
      return new Set<string>()
    }

    // Find indices of selected keys
    const selectedIndices: number[] = []
    allKeysInOrder.forEach((key, index) => {
      if (allSelectedKeys.has(key)) {
        selectedIndices.push(index)
      }
    })

    if (selectedIndices.length < 2) {
      return new Set<string>()
    }

    const minIndex = Math.min(...selectedIndices)
    const maxIndex = Math.max(...selectedIndices)

    // Get all keys between min and max that are not selected
    const inBetween = new Set<string>()
    for (let i = minIndex; i <= maxIndex; i++) {
      const key = allKeysInOrder[i]
      if (!allSelectedKeys.has(key)) {
        inBetween.add(key)
      }
    }

    return inBetween
  }, [highlightedKeys, midiHighlightedKeys, allKeysInOrder])

  // Combine both highlight sources, with gray for in-between keys
  const getCombinedHighlight = useCallback(
    (note: string): string | undefined => {
      // Selected keys keep their active color
      const selectedColor = midiHighlightedKeys[note] || highlightedKeys[note]
      if (selectedColor) {
        return selectedColor
      }

      // Check if this key should be gray (in-between unselected)
      if (inBetweenKeys.has(note)) {
        return "rgb(214, 214, 214)"
      }

      return undefined
    },
    [highlightedKeys, midiHighlightedKeys, inBetweenKeys]
  )

  const renderOctave = (octaveNumber: number) => {
    return OCTAVE_PATTERN.map(({ note, hasBlack }) => {
      const fullNote = `${note}${octaveNumber}`
      const sharpNote = `${note}#${octaveNumber}`
      
      return (
        <div key={fullNote} className="relative">
          <PianoKey
            note={fullNote}
            isPressed={pressedKeys.has(fullNote)}
            highlightColor={getCombinedHighlight(fullNote)}
            onPress={handleKeyPress}
            onRelease={handleKeyRelease}
          />
          {hasBlack && (
            <PianoKey
              note={sharpNote}
              isBlack
              isPressed={pressedKeys.has(sharpNote)}
              highlightColor={getCombinedHighlight(sharpNote)}
              onPress={handleKeyPress}
              onRelease={handleKeyRelease}
            />
          )}
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="inline-flex border-piano-border rounded-b-sm bg-piano-frame border">
        <div className="flex">
          {[3, 4, 5].map((octave) => (
            <div key={octave} className="flex">
              {renderOctave(octave)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                selectedColor === color
                  ? "ring-2 ring-offset-2 ring-foreground scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
            aria-label="Custom color picker"
          />
        </div>
        <Button
          variant="outline"
          onClick={clearAllHighlights}
          className="bg-transparent cursor-pointer transition-opacity hover:opacity-70"
        >
          Clear
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsMuted(!isMuted)}
          className={`bg-transparent cursor-pointer transition-colors ${
            isMuted 
              ? "bg-muted text-muted-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div
          className={`w-2 h-2 rounded-full ${
            midiStatus === "connected"
              ? "bg-green-500"
              : midiStatus === "connecting"
                ? "bg-yellow-500"
                : midiStatus === "unsupported"
                  ? "bg-red-500"
                  : "bg-muted-foreground"
          }`}
        />
        <span>
          {midiStatus === "connected" && midiDeviceName
            ? `MIDI: ${midiDeviceName}`
            : midiStatus === "connected"
              ? "MIDI Connected"
              : midiStatus === "connecting"
                ? "Connecting MIDI..."
                : midiStatus === "unsupported"
                  ? "MIDI not supported"
                  : "No MIDI device"}
        </span>
      </div>
    </div>
  )
}
