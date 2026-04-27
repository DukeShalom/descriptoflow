import React, { useState, useEffect } from 'react'
import SkuForm from './components/SkuForm.jsx'
import BulkInput from './components/BulkInput.jsx'

// ---- Header Progress Bar ----
function ProgressBar({ loading }) {
  return (
    <div className="progress-bar-track">
      <div className={`progress-bar-fill ${loading ? 'loading' : ''}`} />
    </div>
  )
}

// ---- Header ----
function Header({ loading }) {
  return (
    <header style={{
      background: 'var(--surface-1)',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
      }}>
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Orange square logomark */}
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--accent)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 3,
            padding: '5px 6px',
            borderRadius: 2,
            flexShrink: 0,
          }}>
            {[14, 10, 12, 8].map((w, i) => (
              <div key={i} style={{
                height: 2,
                width: w,
                background: '#000',
                borderRadius: 1,
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              COPY.GEN
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--accent)',
              lineHeight: 1,
            }}>
              ·
            </span>
          </div>

          <div style={{
            height: 20,
            width: 1,
            background: 'var(--border)',
            margin: '0 4px',
          }} />

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}>
            AI PRODUCT DESCRIPTION WRITER
          </span>
        </div>

        {/* Powered by badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          <span style={{
            fontSize: 12,
            color: 'var(--accent-gold)',
            lineHeight: 1,
          }}>
            ✦
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
          }}>
            Powered by Claude AI
          </span>
        </div>
      </div>

      {/* Animated progress bar */}
      <ProgressBar loading={loading} />
    </header>
  )
}

// ---- Mode Tabs ----
function ModeTabs({ activeTab, onChange }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 24,
      flexShrink: 0,
    }}>
      <button
        className={`mode-tab ${activeTab === 'single' ? 'active' : ''}`}
        onClick={() => onChange('single')}
      >
        [ SINGLE SKU ]
      </button>
      <button
        className={`mode-tab ${activeTab === 'bulk' ? 'active' : ''}`}
        onClick={() => onChange('bulk')}
      >
        [ BULK MODE ]
      </button>

      {/* Right-side status indicator */}
      <div style={{
        marginLeft: 'auto',
        marginRight: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 6px var(--success)',
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          SYSTEM ONLINE
        </span>
      </div>
    </div>
  )
}

// ---- App ----
export default function App() {
  const [activeTab, setActiveTab] = useState('single')
  const [loading, setLoading] = useState(false)
  const [tabKey, setTabKey] = useState(0)

  useEffect(() => {
    const handler = (e) => setLoading(e.detail.loading)
    window.addEventListener('copygen:loading', handler)
    return () => window.removeEventListener('copygen:loading', handler)
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setTabKey(k => k + 1)
  }

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Header loading={loading} />
      <ModeTabs activeTab={activeTab} onChange={handleTabChange} />

      {/* Main content area */}
      <main style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {activeTab === 'single' && (
          <div
            key={`single-${tabKey}`}
            className="two-col-layout"
            style={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <SkuForm />
          </div>
        )}
        {activeTab === 'bulk' && (
          <div
            key={`bulk-${tabKey}`}
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <BulkInput />
          </div>
        )}
      </main>

      {/* Footer status bar */}
      <footer style={{
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--border)',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          COPY.GEN v1.0.0
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          SHOPIFY · AMAZON · OPTIMIZED FOR CONVERSIONS
        </span>
      </footer>
    </div>
  )
}
