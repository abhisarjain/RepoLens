# The Clockwork Orchard

This README is a small RepoLens demo with multiple roots, nested sections, code, lists, and a table.

## Why I Built This

Every heading should appear exactly as written.

> A map is useful only when it leaves the landmarks where the author put them.

### Paths Through the Orchard

- Enter through the brass gate.
  - Check the western dial.
  - Listen for two chimes.
- Follow the paper lanterns.

#### A Tiny Program

```typescript
type Orbit = { name: string; minutes: number };

export const nextOrbit = (orbits: Orbit[]): Orbit | undefined =>
  [...orbits].sort((a, b) => a.minutes - b.minutes)[0];
```

## Setup

```bash
npm install
npm run orchard
```

### Linux & macOS

Set `ORCHARD_PORT=4100`, then run the command above.

## Things That Broke

#### Why This Broke at 3AM

| Event | What was observed | Recovery |
| --- | --- | --- |
| First chime | Lanterns dimmed | Reset the west dial |
| Dawn | All clocks agreed | Wrote this table |

### A Picture From Outside

![Markdown logo](https://raw.githubusercontent.com/github/explore/main/topics/markdown/markdown.png)

## Stuff I Might Add Later

1. A quieter bell.
2. A map that folds itself.
3. Labels that remain exactly as written.

# Notes From Another Root

This second H1 demonstrates multiple independent root nodes.

## Closing Time

Nothing follows this paragraph, so it belongs to this node.
