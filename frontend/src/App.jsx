import { useState, useRef, useEffect } from 'react'
import TreeCanvas from './components/TreeCanvas'
import { useMentor } from './hooks/useMentor'

const SENTIMENT_LABEL = {
  positive: { text: 'The tree blooms 🌿', color: '#7ec850' },
  neutral:  { text: 'The tree listens 🌊', color: '#48D1CC' },
  negative: { text: 'The tree holds space 🌑', color: '#9370DB' },
}

const THINKING_MESSAGES = [
  'The roots reach deep…',
  'Ancient wisdom stirs…',
  'The leaves whisper…',
  'Centuries of knowing…',
]

export default function App() {
  const [input, setInput] = useState('')
  const [thinkingMsg, setThinkingMsg] = useState(THINKING_MESSAGES[0])
  const { response, isLoading, error, askMentor } = useMentor()
  const textareaRef = useRef(null)
  const thinkingInterval = useRef(null)

  // Cycle thinking messages while loading
  useEffect(() => {
    if (isLoading) {
      let i = 0
      thinkingInterval.current = setInterval(() => {
        i = (i + 1) % THINKING_MESSAGES.length
        setThinkingMsg(THINKING_MESSAGES[i])
      }, 1400)
    } else {
      clearInterval(thinkingInterval.current)
    }
    return () => clearInterval(thinkingInterval.current)
  }, [isLoading])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    askMentor(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const sentiment = SENTIMENT_LABEL[response.sentiment] || SENTIMENT_LABEL.neutral

  return (
    <div style={styles.root}>
      {/* ── 3D Canvas fills background ─────────────────────────────── */}
      <div style={styles.canvasWrapper}>
        <TreeCanvas treeReaction={response.tree_reaction} isThinking={isLoading} />
      </div>

      {/* ── Subtle vignette overlay ────────────────────────────────── */}
      <div style={styles.vignette} />

      {/* ── Top title bar ─────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerDot} />
        <span style={styles.headerTitle}>The Ancient Tree</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...styles.sentimentBadge, color: sentiment.color, borderColor: sentiment.color + '44' }}>
          {sentiment.text}
        </span>
      </header>

      {/* ── Advice panel ──────────────────────────────────────────── */}
      <div style={styles.adviceArea}>
        {isLoading && (
          <div style={styles.thinkingBox} key="thinking">
            <div style={{ ...styles.thinkingDot, backgroundColor: response.tree_reaction }} />
            <span style={{ ...styles.thinkingText, color: response.tree_reaction }}>
              {thinkingMsg}
            </span>
          </div>
        )}

        {!isLoading && error && (
          <div style={styles.errorBox}>
            <span>⚠ {error}</span>
          </div>
        )}

        {!isLoading && response.advice && !error && (
          <div style={styles.adviceBox} key={response.advice}>
            <div style={{ ...styles.adviceAccent, backgroundColor: response.tree_reaction }} />
            <p style={styles.adviceText}>{response.advice}</p>
          </div>
        )}

        {!isLoading && !response.advice && !error && (
          <div style={styles.promptHint}>
            <p>Share a problem or question with the tree.</p>
            <p style={{ fontSize: '0.85em', marginTop: 6, opacity: 0.5 }}>
              It has stood for centuries and seen it all.
            </p>
          </div>
        )}
      </div>

      {/* ── Input panel ───────────────────────────────────────────── */}
      <div style={styles.inputPanel}>
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the tree anything… (Enter to send)"
            maxLength={1000}
            rows={3}
            disabled={isLoading}
            style={{
              ...styles.textarea,
              borderColor: isLoading
                ? response.tree_reaction + '66'
                : 'rgba(100,160,80,0.25)',
            }}
          />
          <div style={styles.inputFooter}>
            <span style={styles.charCount}>{input.length}/1000</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              style={{
                ...styles.button,
                backgroundColor: !input.trim() || isLoading ? 'rgba(100,160,80,0.15)' : response.tree_reaction,
                color: !input.trim() || isLoading ? 'rgba(200,220,180,0.4)' : '#0a0f0a',
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? '…' : 'Consult'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Inline styles ───────────────────────────────────────────────────────────
const styles = {
  root: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Crimson Pro', serif",
    background: '#0a0f0a',
  },
  canvasWrapper: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,10,5,0.7) 100%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 24px',
    background: 'linear-gradient(to bottom, rgba(10,15,10,0.9) 0%, transparent 100%)',
  },
  headerDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: '#7ec850',
    boxShadow: '0 0 8px #7ec850',
  },
  headerTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.3rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#e8eed4',
  },
  sentimentBadge: {
    fontSize: '0.78rem',
    letterSpacing: '0.04em',
    border: '1px solid',
    borderRadius: 20,
    padding: '3px 12px',
    transition: 'all 0.6s ease',
  },
  adviceArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    width: '90%',
    maxWidth: 460,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  adviceBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    animation: 'fadeUp 0.6s ease forwards',
  },
  adviceAccent: {
    width: 32, height: 2,
    borderRadius: 2,
    transition: 'background-color 0.8s ease',
  },
  adviceText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.25rem',
    fontWeight: 300,
    fontStyle: 'italic',
    lineHeight: 1.7,
    color: '#e8eed4',
    textShadow: '0 2px 20px rgba(0,0,0,0.8)',
  },
  promptHint: {
    color: 'rgba(200,220,180,0.35)',
    fontSize: '1rem',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  thinkingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    animation: 'shimmer 1.4s ease infinite',
  },
  thinkingDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    animation: 'pulse-ring 1.4s ease infinite',
  },
  thinkingText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.1rem',
    fontStyle: 'italic',
    transition: 'color 0.8s ease',
  },
  errorBox: {
    color: '#e09a6a',
    fontSize: '0.9rem',
    background: 'rgba(80,30,10,0.5)',
    border: '1px solid rgba(200,100,50,0.3)',
    borderRadius: 8,
    padding: '10px 16px',
  },
  inputPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 10,
    padding: '0 20px 24px',
    background: 'linear-gradient(to top, rgba(10,15,10,0.95) 60%, transparent 100%)',
  },
  inputWrapper: {
    maxWidth: 600,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  textarea: {
    width: '100%',
    background: 'rgba(15,25,15,0.8)',
    border: '1px solid',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#e8eed4',
    fontFamily: "'Crimson Pro', serif",
    fontSize: '1rem',
    lineHeight: 1.5,
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.4s ease',
    backdropFilter: 'blur(8px)',
  },
  inputFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: '0.75rem',
    color: 'rgba(140,170,100,0.45)',
  },
  button: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    padding: '8px 28px',
    borderRadius: 6,
    border: 'none',
    transition: 'all 0.3s ease',
  },
}
