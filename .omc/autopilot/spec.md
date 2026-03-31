# UI Redesign Specification — 범용 프롬프트 생성기
**Target aesthetic:** Vercel / Linear / Notion — dark-first, precise, minimal, with intentional motion.

---

## 0. Inventory of Current State

| Element | Current | Problem |
|---|---|---|
| Body background | `#f0f2f5` (light grey) | Washed-out, dated |
| Header | `#1e293b` dark + white text | OK basis but visually heavy |
| Progress bar | White bg, flat dots + connectors | Connector is just a 4px wide pseudo-element — invisible at a glance |
| User bubble | `#3b82f6` solid fill | Fine but generic |
| Agent bubble | White card with faint shadow | Indistinguishable from the progress bar background |
| Final prompt box | White + `#22c55e` 2px border | Celebratory intent is good, execution is plain |
| Copy button | Flat `#f1f5f9` pill | No visual weight |
| Footer / input | White bg, light border textarea | Blends into page on light mode |

---

## 1. Color Palette — Dark Mode

### Base Surfaces
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0a0a0f` | Body / page background |
| `--bg-surface-1` | `#111118` | Header, footer, progress bar, modals |
| `--bg-surface-2` | `#18181f` | Chat area fill |
| `--bg-surface-3` | `#1e1e28` | Cards, agent bubble background |
| `--bg-surface-4` | `#252530` | Hover states, input focus fill |

### Borders
| Token | Hex | Usage |
|---|---|---|
| `--border-subtle` | `#1f1f2e` | Default hairline borders |
| `--border-default` | `#2a2a3d` | Visible separators (header bottom, footer top) |
| `--border-strong` | `#3a3a55` | Focus rings, active states |

### Text
| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#f0f0ff` | Body text, headings |
| `--text-secondary` | `#8b8baa` | Labels, placeholders, muted info |
| `--text-tertiary` | `#4a4a6a` | Disabled states, faint connectors |

### Accent — Electric Indigo
| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#7c6cf8` | Primary CTA, active node dot, user bubble |
| `--accent-hover` | `#9585ff` | Button hover |
| `--accent-muted` | `rgba(124,108,248,0.12)` | Glow rings, backdrop tints |
| `--accent-glow` | `rgba(124,108,248,0.25)` | Pulse animation outer ring |

### Semantic
| Token | Hex | Usage |
|---|---|---|
| `--success` | `#34d399` | Done node dot, final-prompt accent |
| `--success-muted` | `rgba(52,211,153,0.10)` | Final prompt box tint |
| `--success-border` | `rgba(52,211,153,0.30)` | Final prompt box border |
| `--error` | `#f87171` | Error bubble text |
| `--error-bg` | `rgba(248,113,113,0.08)` | Error bubble fill |

---

## 2. Typography

### Font Stack
```
--font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace;
```
Load Inter via Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap`

### Scale
| Token | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `--text-xs` | 11px | 500 | 1.4 | Node step labels |
| `--text-sm` | 13px | 400 | 1.5 | Timestamps, copy button, fp-label |
| `--text-base` | 14px | 400 | 1.6 | Chat bubbles, textarea |
| `--text-lg` | 15px | 500 | 1.5 | Header title |
| `--text-xl` | 17px | 600 | 1.3 | Final prompt pre content |

Letter-spacing:
- All-caps labels (`fp-label`, node labels): `letter-spacing: 0.06em`
- Header title: `letter-spacing: -0.01em`

---

## 3. Layout Changes

### 3.1 Overall Shell
```
html, body              → height: 100dvh (use dynamic viewport height for mobile)
body                    → background: var(--bg-base); color: var(--text-primary)
display: flex; flex-direction: column; overflow: hidden
```
Remove the light-grey body background entirely. The page is now full-dark.

### 3.2 Header
- Height: **52px** (down from ~46px, but add defined height for crisp layout)
- Background: `var(--bg-surface-1)`
- Bottom border: `1px solid var(--border-default)`
- Padding: `0 24px`
- Title: `--text-lg`, weight 600, `var(--text-primary)`, include a small SVG sparkle or prompt icon (16x16) to the left, gap 8px
- New Session button: see Section 4 (Buttons)
- Add a subtle `box-shadow: 0 1px 0 var(--border-subtle)` below the border for depth

### 3.3 Progress Bar (`#progress-bar`)
- Background: `var(--bg-surface-1)`
- Bottom border: `1px solid var(--border-subtle)`
- Padding: `12px 24px`
- `justify-content: center`; `gap: 0` (connectors are handled by pseudo-elements)
- Total height: ~54px

Connector line redesign:
- Current `.node-step:not(:last-child)::after` is 4px wide and invisible
- New: `width: 40px; height: 1px; background: var(--border-default); top: 10px; right: -20px;`
- When the previous step is `.done`: connector should turn `var(--success)` — achieved by `.node-step.done + .node-step::before` with `background: var(--success); opacity: 0.5`

### 3.4 Chat Area (`#chat-container`, `#messages`)
- `#chat-container`: background `var(--bg-surface-2)`, flex: 1, overflow-y: auto, padding `24px 20px`
- `#messages`: max-width `720px`; margin `0 auto`; gap `16px`
- Custom scrollbar: `width: 4px; background: transparent; thumb: var(--border-strong); border-radius: 4px`

### 3.5 Footer / Input Area
- Background: `var(--bg-surface-1)`
- Top border: `1px solid var(--border-default)`
- Padding: `14px 24px`
- `#input-area`: max-width `720px`; margin `0 auto`; gap `10px`; align-items `flex-end`

---

## 4. Component Redesigns

### 4.1 Node Step Dots (`.node-step`, `.dot`, `.label`)

**Default state:**
```
.dot
  width: 20px; height: 20px
  border-radius: 50%
  background: var(--bg-surface-3)
  border: 1.5px solid var(--border-strong)
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1)

.label
  font-size: var(--text-xs)
  color: var(--text-tertiary)
  letter-spacing: 0.06em
  text-transform: uppercase
  transition: color 0.25s
```

**Active state (`.node-step.active`):**
```
.dot
  background: var(--accent)
  border-color: var(--accent)
  box-shadow: 0 0 0 4px var(--accent-muted), 0 0 16px var(--accent-glow)

.label
  color: var(--accent)
  font-weight: 600
```
Replace current `pulse` keyframe with a two-ring glow pulse:
```css
@keyframes node-pulse {
  0%   { box-shadow: 0 0 0 0   var(--accent-muted), 0 0 8px  var(--accent-glow); }
  50%  { box-shadow: 0 0 0 6px var(--accent-muted), 0 0 20px var(--accent-glow); }
  100% { box-shadow: 0 0 0 0   var(--accent-muted), 0 0 8px  var(--accent-glow); }
}
animation: node-pulse 1.4s ease-in-out infinite;
```

**Done state (`.node-step.done`):**
```
.dot
  background: var(--success)
  border-color: var(--success)
  /* checkmark via ::after pseudo-element */
.dot::after
  content: ""
  display: block
  width: 5px; height: 9px
  border: 2px solid #0a0a0f
  border-top: none; border-left: none
  transform: rotate(45deg) translate(-1px, -1px)

.label
  color: var(--success)
```

### 4.2 Chat Bubbles (`.bubble-wrap`, `.bubble`)

**Shared:**
```
.bubble
  font-size: var(--text-base)
  line-height: 1.6
  padding: 10px 14px
  border-radius: 14px
  max-width: 72%
  word-break: break-word
  white-space: pre-wrap
```

**User bubble (`.bubble-wrap.user .bubble`):**
```
background: var(--accent)
color: #ffffff
border-bottom-right-radius: 3px
box-shadow: 0 2px 12px rgba(124,108,248,0.30)
```

**Agent bubble (`.bubble-wrap.agent .bubble`):**
```
background: var(--bg-surface-3)
color: var(--text-primary)
border: 1px solid var(--border-subtle)
border-bottom-left-radius: 3px
box-shadow: none
```

Add role icon for agent: prepend a small (20x20) rounded-square avatar with a monogram "AI" in `var(--accent)` at font-size 9px, positioned to the left of the bubble with `gap: 8px` in the flex row. Class: `.bubble-avatar`.

**Error bubble (`.bubble-wrap.error .bubble`):**
```
background: var(--error-bg)
color: var(--error)
border: 1px solid rgba(248,113,113,0.20)
border-radius: 10px
```

### 4.3 Final Prompt Box (`.final-prompt-box`)
This is the most important screen-moment — deserves a premium treatment.

```
.final-prompt-box
  max-width: 720px
  margin: 8px auto
  background: var(--bg-surface-3)
  border: 1px solid var(--success-border)
  border-radius: 16px
  padding: 20px 20px 16px
  position: relative
  /* Subtle top-edge glow to signal completion */
  box-shadow: 0 0 0 1px var(--success-border), 0 -2px 24px var(--success-muted)
```

**Label (`.fp-label`):**
```
font-size: 10px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.10em
color: var(--success)
margin-bottom: 12px
display: flex
align-items: center
gap: 6px
/* Prepend a filled check-circle SVG icon (14x14) in var(--success) */
```

**Content (`pre`):**
```
font-family: var(--font-mono)
font-size: 13px
line-height: 1.7
color: var(--text-primary)
background: var(--bg-surface-2)
border-radius: 10px
padding: 14px 16px
border: 1px solid var(--border-subtle)
white-space: pre-wrap
word-break: break-word
```

**Copy button (`.btn-copy`):**
```
position: absolute
top: 16px; right: 16px
background: var(--bg-surface-4)
border: 1px solid var(--border-default)
border-radius: 8px
padding: 5px 12px
font-size: 12px
font-weight: 500
color: var(--text-secondary)
cursor: pointer
transition: all 0.15s ease
letter-spacing: 0.02em
```
Hover: `background: var(--bg-surface-2); border-color: var(--border-strong); color: var(--text-primary)`
Copied state (`.btn-copy.copied`): `color: var(--success); border-color: var(--success-border)`

### 4.4 Buttons

**New Session button (`#btn-new-session`):**
```
background: transparent
color: var(--text-secondary)
border: 1px solid var(--border-strong)
border-radius: 8px
padding: 6px 14px
font-size: 13px
font-weight: 500
cursor: pointer
transition: all 0.15s ease
```
Hover: `background: var(--bg-surface-4); color: var(--text-primary); border-color: var(--accent)`

**Send button (`#btn-send`):**
```
background: var(--accent)
color: #ffffff
border: none
border-radius: 10px
padding: 0 20px
height: 40px
font-size: 14px
font-weight: 500
cursor: pointer
transition: background 0.15s ease, box-shadow 0.15s ease
white-space: nowrap
```
Hover (not disabled): `background: var(--accent-hover); box-shadow: 0 2px 12px rgba(124,108,248,0.35)`
Disabled: `background: rgba(124,108,248,0.25); cursor: not-allowed; color: rgba(255,255,255,0.4)`

### 4.5 Textarea (`#user-input`)
```
flex: 1
resize: none
background: var(--bg-surface-3)
border: 1px solid var(--border-default)
border-radius: 10px
padding: 10px 14px
font-size: var(--text-base)
font-family: var(--font-sans)
color: var(--text-primary)
outline: none
transition: border-color 0.2s, background 0.2s
line-height: 1.5
min-height: 40px
max-height: 140px
```
Placeholder: `color: var(--text-tertiary)`
Focus: `border-color: var(--accent); background: var(--bg-surface-4)`

---

## 5. Animations & Micro-interactions

### 5.1 Bubble Entry Animation
New bubbles should slide in and fade, not just appear.

**Class `.bubble-enter` applied via JS when `appendBubble()` is called:**
```css
@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.bubble-enter {
  animation: bubble-in 0.22s cubic-bezier(0.4, 0, 0.2, 1) both;
}
```
Apply to both `.bubble-wrap` and `.final-prompt-box` on insertion.

### 5.2 Final Prompt Box Entry
The final prompt deserves a more deliberate entrance:
```css
@keyframes final-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.final-prompt-box {
  animation: final-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
```
The `cubic-bezier(0.34, 1.56, 0.64, 1)` gives a subtle spring feel without being cartoonish.

### 5.3 Node Dot Transition to Done
When a node transitions from `.active` to `.done`, add a brief scale bounce:
```css
@keyframes dot-complete {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(0.90); }
  100% { transform: scale(1); }
}
.node-step.done .dot {
  animation: dot-complete 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
```
Trigger by adding `.done` class — the animation fires on class add due to `animation: ... both`.

### 5.4 Send Button Processing State
When `setProcessing(true)` is called, instead of changing `textContent` to "처리 중...", render a spinner inside the button:
- Replace text with an SVG spinner (16x16) + "처리 중" text (or just the spinner for compact look)
- Spinner CSS: `@keyframes spin { to { transform: rotate(360deg); } }` at 0.7s linear infinite
- On `setProcessing(false)`, restore original text without animation

### 5.5 Input Focus Ring
```css
#user-input:focus {
  border-color: var(--accent);
  background: var(--bg-surface-4);
  box-shadow: 0 0 0 3px var(--accent-muted);
  transition: box-shadow 0.2s, border-color 0.2s;
}
```

### 5.6 Scroll Behavior
`scrollToBottom()` should use `{ behavior: 'smooth' }` when the user is already near the bottom; instant scroll when far away (avoids jarring jump during fast message delivery). Detection: `container.scrollHeight - container.scrollTop - container.clientHeight < 80`.

### 5.7 Copy Button Feedback
Current feedback is text change only. Add:
- A brief scale pulse on click: `transform: scale(0.93)` for 100ms then return
- Color transition to `var(--success)` over 200ms

---

## 6. New UI Elements

### 6.1 Thinking Indicator (`.thinking-bubble`)
Currently agent messages are suppressed (`case "ai_message": // Suppressed`). During `node_start` → `node_end` for processing nodes, show a "thinking" bubble that auto-removes on `node_end`:

```
.thinking-bubble
  display: flex
  align-items: center
  gap: 5px
  padding: 10px 14px
  background: var(--bg-surface-3)
  border: 1px solid var(--border-subtle)
  border-radius: 14px
  border-bottom-left-radius: 3px
  max-width: 72px   /* just wide enough for 3 dots */
```

Three animated dots inside (class `.thinking-dot`):
```css
@keyframes thinking-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%            { transform: translateY(-5px); opacity: 1; }
}
.thinking-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: thinking-bounce 1.2s ease-in-out infinite;
}
.thinking-dot:nth-child(2) { animation-delay: 0.15s; }
.thinking-dot:nth-child(3) { animation-delay: 0.30s; }
```

Insert after `setNodeActive()` and remove in `setNodeDone()`.

### 6.2 Connection Status Indicator
Small status dot in the header (right of the title, left of the new-session button) showing WebSocket state:

```
.ws-status
  width: 7px; height: 7px
  border-radius: 50%
  transition: background 0.3s
```
- Connected: `background: var(--success)`
- Connecting: `background: #f59e0b; animation: pulse 1s infinite` (amber)
- Disconnected: `background: var(--error)`

JS: set class `ws-connected | ws-connecting | ws-disconnected` on `ws` open/close/error events.

### 6.3 Empty State
When `#messages` is empty (new session before first message), show a centered placeholder:

```
.empty-state
  display: flex
  flex-direction: column
  align-items: center
  gap: 12px
  margin: auto  /* centers in flex column chat container */
  color: var(--text-tertiary)
  user-select: none
```
- Large icon: 40x40 SVG sparks/wand in `var(--text-tertiary)` at `opacity: 0.5`
- Heading: "어떤 프롬프트를 만들까요?" at `--text-lg`, `var(--text-secondary)`
- Sub-text: "아래에 설명을 입력하세요" at `--text-sm`, `var(--text-tertiary)`

Remove `.empty-state` from DOM on first message append.

### 6.4 Keyboard Shortcut Hint
Inside `#input-area`, below the textarea, add a faint hint line:
```
.input-hint
  font-size: 11px
  color: var(--text-tertiary)
  margin-top: 4px
  padding-left: 2px
  text-content: "Enter to send  ·  Shift+Enter for newline"
```
Only show when textarea is focused (toggle `.input-hint--visible` class on focus/blur with `opacity: 0 → 0.7` transition over 150ms).

---

## 7. CSS Architecture Notes

### 7.1 CSS Custom Properties Block
Add at top of `style.css` under `*, *::before, *::after`:
```css
:root {
  /* Surfaces */
  --bg-base:       #0a0a0f;
  --bg-surface-1:  #111118;
  --bg-surface-2:  #18181f;
  --bg-surface-3:  #1e1e28;
  --bg-surface-4:  #252530;
  /* Borders */
  --border-subtle:  #1f1f2e;
  --border-default: #2a2a3d;
  --border-strong:  #3a3a55;
  /* Text */
  --text-primary:   #f0f0ff;
  --text-secondary: #8b8baa;
  --text-tertiary:  #4a4a6a;
  /* Accent */
  --accent:         #7c6cf8;
  --accent-hover:   #9585ff;
  --accent-muted:   rgba(124,108,248,0.12);
  --accent-glow:    rgba(124,108,248,0.25);
  /* Semantic */
  --success:        #34d399;
  --success-muted:  rgba(52,211,153,0.10);
  --success-border: rgba(52,211,153,0.30);
  --error:          #f87171;
  --error-bg:       rgba(248,113,113,0.08);
  /* Typography */
  --font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --text-xs:  11px;
  --text-sm:  13px;
  --text-base: 14px;
  --text-lg:  15px;
  --text-xl:  17px;
}
```

### 7.2 Scrollbar Styling
```css
#chat-container::-webkit-scrollbar        { width: 4px; }
#chat-container::-webkit-scrollbar-track  { background: transparent; }
#chat-container::-webkit-scrollbar-thumb  { background: var(--border-strong); border-radius: 4px; }
#chat-container::-webkit-scrollbar-thumb:hover { background: var(--accent); }
```

### 7.3 Class Naming Additions (JS Side)
These new classes must be applied in `app.js`:
| Class | When Added |
|---|---|
| `.bubble-enter` | on every `appendBubble()` call |
| `.thinking-bubble` | on `node_start` for processing nodes |
| `.ws-connected` / `.ws-connecting` / `.ws-disconnected` | on ws events |
| `.input-hint--visible` | on textarea focus |
| `.btn-copy.copied` | already exists, add scale pulse |

---

## 8. Outcome Preview

After this redesign:
- The page goes from a dated light-grey chat UI to a dark, premium tool that feels native to the AI tooling ecosystem
- The accent color (#7c6cf8 indigo) gives a distinct identity without being loud
- The progress bar becomes a readable pipeline stepper with glow-dot states
- The final prompt box becomes a visual "moment" with the monospace code block and top glow
- Motion is purposeful: entry animations orient the user, the thinking bubble signals activity without noise
- The empty state and status dot remove ambiguity about connection / readiness

