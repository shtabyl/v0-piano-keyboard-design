# 🎹 Scale Master

**Scale Master** is an interactive web application designed to help musicians and students visualize musical scales and build them dynamically on a piano keyboard. Whether you are practicing music theory or composing, Scale Master provides a clear visual representation of harmonic structures.

## ✨ Features

-   **Interactive Piano Keyboard**: Playable keyboard interface with real-time visual feedback.
-   **Smart Interval Highlighting**: 
    -   When two or more keys are selected, the application automatically highlights the intervals (the "gaps") between the first and last selected notes in a subtle gray (`rgb(214, 214, 214)`).
    -   Easily visualize the distance between notes in any scale or chord.
-   **Advanced Drag-and-Drop Workflow**:
    -   **Infinite Card Supply**: Drag scale/chord cards from the right-side library into functional slots.
    -   **Smart Replacement**: Dropping a new card into an occupied slot automatically replaces the previous one.
    -   **Quick Add**: Simply click a card to send it to the first available empty slot.
    -   **Easy Cleanup**: Drag a card out of its slot and drop it anywhere else to remove it.
-   **Visual Alignment**: Perfectly aligned UI where the control slots and cards match the width of the piano keyboard for a professional look.

## 🛠 Tech Stack

-   **Framework**: [Next.js](https://nextjs.org)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com)
-   **Drag & Drop**: [@dnd-kit](https://dnd-kit.com)
-   **Icons**: [Figma](https://figma.com)
-   **Deployment**: [Vercel](https://vercel.com)
