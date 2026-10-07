# The Clockwork Orchard

This README is a parser fixture disguised as a tiny project journal. RepoLens should preserve this sentence, the inline value `orbitCount = 3`, and the [CommonMark reference](https://commonmark.org/) without interpreting what they mean.

---

## Why I Built This

I wanted one place where odd headings, ordinary prose, and structural edge cases could coexist. Every heading in this file should appear exactly as written.

> A map is useful only when it leaves the landmarks where the author put them.

### Paths Through the Orchard

The route contains both unordered and ordered nested lists:

- Enter through the brass gate.
  - Check the western dial.
    - Record its smallest hand.
  - Listen for two chimes.
- Follow the paper lanterns.
  1. Stop at the blue marker.
  2. Continue to the glass tree.
     1. Note the time.
     2. Return by the same path.

#### A Tiny Program

This fenced block has a language label and should remain attached only to this heading.

```typescript
type Orbit = { name: string; minutes: number };

export const nextOrbit = (orbits: Orbit[]): Orbit | undefined =>
  [...orbits].sort((a, b) => a.minutes - b.minutes)[0];
```

The old maintenance notes also contain an indented block:

    make inspect
    make retry MODE=careful

## Setup

This is the first heading named Setup. Its visible title must not receive a suffix.

```bash
npm install
npm run orchard
```

### Linux & macOS

Set `ORCHARD_PORT=4100`, then run the command above from a POSIX shell.

## Setup

This is a second, distinct heading with the exact same title. RepoLens should give it a unique internal ID while still displaying only “Setup”.

### Windows

PowerShell users can set the value for the current session:

```powershell
$env:ORCHARD_PORT = "4100"
npm run orchard
```

## Things That Broke

This branch intentionally jumps from level two to level four next.

#### Why This Broke at 3AM

The fourth-level heading must attach to the nearest previous heading with a lower level even though there is no level-three heading between them.

| Event | What was observed | Recovery |
| --- | --- | --- |
| First chime | Lanterns dimmed | Reset the west dial |
| Second chime | Gate stayed open | Replaced one brass pin |
| Dawn | All clocks agreed | Wrote this table |

###### Log Fragment

This level-six heading skips level five. Its source level should remain `6` rather than being normalized to fit the gap.

```text
03:07:12 gate=OPEN dial=UNKNOWN
03:08:44 gate=CLOSED dial=WEST
```

### A Picture From Outside

The image is remote on purpose so the image renderer and preview path exercise a normal Markdown URL.

![Markdown logo from GitHub Explore](https://raw.githubusercontent.com/github/explore/main/topics/markdown/markdown.png)

##### The Caption Nobody Expected Here

This heading skips level four. It should still remain beneath “A Picture From Outside” because that is the closest earlier heading with a lower level.

See the [RepoLens project README](../README.md) for local setup and API details.

## Stuff I Might Add Later

1. A quieter bell.
2. A map that folds itself.
3. Labels that remain exactly as their author wrote them.

# Notes From Another Root

This second H1 proves that a document may have multiple visible roots. RepoLens may use an invisible layout root, but it must not invent a title for one.

## Setup

This third duplicate title belongs to the second root and remains independent from both earlier Setup nodes.

### Closing Time

Nothing follows this paragraph. It therefore belongs to “Closing Time” and should remain visible in that node's content panel.
