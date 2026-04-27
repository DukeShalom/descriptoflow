import React, { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import ResultCard, { EmptyResults } from './ResultCard.jsx'
import { mockGenerate } from '../mockApi.js'

const PLATFORMS = ['SHOPIFY', 'AMAZON', 'BOTH']
const TONES = ['PROFESSIONAL', 'CASUAL', 'LUXURY', 'TECHNICAL']

const DEFAULT_FORM = {
  sku: '',
  productName: '',
  category: '',
  keyFeatures: '',
  targetAudience: '',
  keywords: '',
  platform: 'SHOPIFY',
  tone: 'PROFESSIONAL',
  includeHtml: false,
}

export default function SkuForm() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [resultKey, setResultKey] = useState(0)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productName.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    const payload = {
      sku: form.sku,
      productName: form.productName,
      category: form.category,
      keyFeatures: form.keyFeatures,
      targetAudience: form.targetAudience,
      keywords: form.keywords,
      platform: form.platform.toLowerCase(),
      tone: form.tone.toLowerCase(),
      includeHtml: form.includeHtml,
    }

    window.dispatchEvent(new CustomEvent('copygen:loading', { detail: { loading: true } }))
    try {
      const json = await mockGenerate(payload)
      setResult(json.data)
      setResultKey(k => k + 1)
    } catch (err) {
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('copygen:loading', { detail: { loading: false } }))
      }, 400)
    }
  }

  return (
    <div
      className="content-enter"
      style={{
        display: 'flex',
        gap: 0,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* ===== LEFT PANEL: FORM ===== */}
      <div
        className="form-panel"
        style={{
          width: 380,
          minWidth: 320,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '24px 24px',
        }}
      >
        <form onSubmit={handleSubmit}>

          {/* ---- Section: Product Details ---- */}
          <div className="section-label">// PRODUCT DETAILS</div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">SKU ID</label>
            <input
              type="text"
              value={form.sku}
              onChange={e => handleChange('sku', e.target.value)}
              placeholder="e.g. SKU-001"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Product Name *</label>
            <input
              type="text"
              value={form.productName}
              onChange={e => handleChange('productName', e.target.value)}
              placeholder="e.g. Stainless Steel Water Bottle 32oz"
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
              placeholder="e.g. Kitchen & Dining"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Key Features</label>
            <textarea
              rows={3}
              value={form.keyFeatures}
              onChange={e => handleChange('keyFeatures', e.target.value)}
              placeholder="List features separated by commas: BPA-free, double-wall insulated, leak-proof lid..."
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Target Audience</label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={e => handleChange('targetAudience', e.target.value)}
              placeholder="e.g. outdoor enthusiasts, gym-goers"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="field-label">Target Keywords</label>
            <input
              type="text"
              value={form.keywords}
              onChange={e => handleChange('keywords', e.target.value)}
              placeholder="e.g. insulated water bottle, stainless steel bottle"
            />
          </div>

          <hr className="divider" />

          {/* ---- Section: Output Settings ---- */}
          <div className="section-label" style={{ marginTop: 16 }}>// OUTPUT SETTINGS</div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Platform</label>
            <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`toggle-btn ${form.platform === p ? 'active' : ''}`}
                  onClick={() => handleChange('platform', p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Tone</label>
            <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
              {TONES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`toggle-btn ${form.tone === t ? 'active' : ''}`}
                  onClick={() => handleChange('tone', t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              className="toggle-switch"
              style={{ cursor: 'pointer' }}
              onClick={() => handleChange('includeHtml', !form.includeHtml)}
            >
              <div className={`toggle-track ${form.includeHtml ? 'on' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="toggle-label">Include HTML tags in description</span>
            </label>
          </div>

          {/* ---- Submit ---- */}
          <button
            type="submit"
            className={`generate-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !form.productName.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                GENERATING...
              </>
            ) : (
              <>GENERATE DESCRIPTION →</>
            )}
          </button>

        </form>
      </div>

      {/* ===== RIGHT PANEL: RESULTS ===== */}
      <div
        className="results-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 24px',
          minWidth: 0,
        }}
      >
        {error && (
          <div className="error-banner" style={{ marginBottom: 16 }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {!result && !error && !loading && <EmptyResults />}

        {loading && !result && (
          <div className="empty-state">
            <Loader2 size={28} color="var(--accent)" className="spin" />
            <span style={{ color: 'var(--accent)' }}>// GENERATING...</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Claude AI is crafting your descriptions
            </span>
          </div>
        )}

        {result && (
          <div key={resultKey}>
            {/* Results header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--success)',
                letterSpacing: '0.06em',
              }}>
                ✓ GENERATION COMPLETE
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
              }}>
                {result.productName}
              </span>
            </div>

            <ResultCard data={result} />
          </div>
        )}
      </div>
    </div>
  )
}
