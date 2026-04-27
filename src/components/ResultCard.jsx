import React, { useState, useCallback } from 'react'
import { Copy, Check, FileText } from 'lucide-react'

// ---- CopyField: a single copyable text block ----
function CopyField({ label, value, multiline = false, height = 'auto', staggerClass = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  return (
    <div className={staggerClass} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <span className="field-label">{label}</span>
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={!value}
        >
          {copied
            ? <><Check size={10} /><span>COPIED</span></>
            : <><Copy size={10} /><span>COPY</span></>
          }
        </button>
      </div>
      {multiline ? (
        <textarea
          readOnly
          value={value || ''}
          style={{
            width: '100%',
            height: height,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '8px 10px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'vertical',
            cursor: 'default',
          }}
        />
      ) : (
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '8px 10px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          wordBreak: 'break-word',
          minHeight: 36,
        }}>
          {value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </div>
      )}
    </div>
  )
}

// ---- BulletList: numbered bullets, each copyable ----
function BulletList({ label, items = [], staggerClass = '' }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  const handleCopy = useCallback(async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }, [])

  return (
    <div className={staggerClass} style={{ marginBottom: 14 }}>
      <span className="field-label" style={{ marginBottom: 8, display: 'block' }}>{label}</span>
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        {(!items || items.length === 0) ? (
          <div style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: 12 }}>—</div>
        ) : items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '7px 10px',
              borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--accent)',
              minWidth: 18,
              marginTop: 1,
            }}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {item}
            </span>
            <button
              className={`copy-btn ${copiedIdx === idx ? 'copied' : ''}`}
              onClick={() => handleCopy(item, idx)}
              style={{ flexShrink: 0 }}
            >
              {copiedIdx === idx
                ? <><Check size={10} /><span>✓</span></>
                : <Copy size={10} />
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- TagList ----
function TagList({ label, tags = [], staggerClass = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = useCallback(async () => {
    const text = (tags || []).join(', ')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [tags])

  return (
    <div className={staggerClass} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="field-label">{label}</span>
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopyAll}
          disabled={!tags || tags.length === 0}
        >
          {copied
            ? <><Check size={10} /><span>COPIED</span></>
            : <><Copy size={10} /><span>COPY ALL</span></>
          }
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(!tags || tags.length === 0)
          ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
          : tags.map((tag, idx) => (
            <span key={idx} className="tag-pill">{tag}</span>
          ))
        }
      </div>
    </div>
  )
}

// ---- Platform section for Shopify ----
function ShopifySection({ data }) {
  if (!data) return null
  return (
    <div>
      <CopyField label="// TITLE" value={data.title} staggerClass="stagger-1" />
      <CopyField label="// META DESCRIPTION" value={data.metaDescription} staggerClass="stagger-2" />
      <CopyField label="// DESCRIPTION" value={data.description} multiline height="150px" staggerClass="stagger-3" />
      <BulletList label="// BULLET POINTS" items={data.bulletPoints} staggerClass="stagger-4" />
      <TagList label="// TAGS" tags={data.tags} staggerClass="stagger-5" />
    </div>
  )
}

// ---- Platform section for Amazon ----
function AmazonSection({ data }) {
  if (!data) return null
  return (
    <div>
      <CopyField label="// TITLE" value={data.title} staggerClass="stagger-1" />
      <BulletList label="// BULLET POINTS" items={data.bulletPoints} staggerClass="stagger-2" />
      <CopyField label="// DESCRIPTION" value={data.description} multiline height="150px" staggerClass="stagger-3" />
      <TagList label="// SEARCH TERMS" tags={data.searchTerms} staggerClass="stagger-4" />
    </div>
  )
}

// ---- Main ResultCard ----
export default function ResultCard({ data }) {
  const hasBoth = data?.shopify && data?.amazon
  const [activeTab, setActiveTab] = useState(data?.shopify ? 'shopify' : 'amazon')

  if (!data) return null

  return (
    <div style={{ animation: 'staggerFade 0.3s ease-out both' }}>

      {/* Platform tabs (only if both) */}
      {hasBoth && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          <button
            className={`result-tab ${activeTab === 'shopify' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopify')}
          >
            SHOPIFY
          </button>
          <button
            className={`result-tab ${activeTab === 'amazon' ? 'active' : ''}`}
            onClick={() => setActiveTab('amazon')}
          >
            AMAZON
          </button>
        </div>
      )}

      {/* Single platform header if not both */}
      {!hasBoth && (
        <div style={{
          borderBottom: '1px solid var(--border)',
          marginBottom: 16,
          paddingBottom: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '0.06em',
          }}>
            {data.shopify ? '// SHOPIFY' : '// AMAZON'}
          </span>
        </div>
      )}

      {/* Platform content */}
      {activeTab === 'shopify' && <ShopifySection data={data.shopify} />}
      {activeTab === 'amazon' && <AmazonSection data={data.amazon} />}

      {/* Meta info footer */}
      {data.generatedAt && (
        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            GENERATED {new Date(data.generatedAt).toLocaleString().toUpperCase()}
          </span>
          {data.sku && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              SKU: {data.sku}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Empty results panel ----
export function EmptyResults() {
  return (
    <div className="empty-state">
      <FileText size={32} color="var(--text-muted)" strokeWidth={1} />
      <span>// RESULTS WILL APPEAR HERE</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.6 }}>
        Fill in the form and click GENERATE
      </span>
    </div>
  )
}
