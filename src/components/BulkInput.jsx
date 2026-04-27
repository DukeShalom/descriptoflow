import React, { useState, useCallback } from 'react'
import { Loader2, Trash2, Plus, AlertCircle, ChevronDown, ChevronRight, Download } from 'lucide-react'
import ResultCard from './ResultCard.jsx'
import ExportButton from './ExportButton.jsx'
import { mockGenerateBulk } from '../mockApi.js'

const PLATFORMS_OPT = ['shopify', 'amazon', 'both']
const TONES_OPT = ['professional', 'casual', 'luxury', 'technical']
const MAX_ROWS = 20

const SAMPLE_CSV = `sku,productName,category,keyFeatures,targetAudience,keywords,platform,tone
SKU001,Widget Pro,Electronics,"Bluetooth 5.0, 20hr battery, foldable design",Commuters,"wireless headphones, bluetooth headphones",shopify,professional
SKU002,EcoBottle 32oz,Kitchen & Dining,"BPA-free, double-wall insulated, leak-proof",Outdoor enthusiasts,"insulated water bottle, stainless steel",amazon,casual`

function newRow() {
  return {
    id: crypto.randomUUID(),
    sku: '',
    productName: '',
    category: '',
    keyFeatures: '',
    targetAudience: '',
    keywords: '',
    platform: 'shopify',
    tone: 'professional',
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  // Parse header
  const headers = parseCSVLine(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || '').trim()
    })
    rows.push({
      id: crypto.randomUUID(),
      sku: obj.sku || '',
      productName: obj.productName || '',
      category: obj.category || '',
      keyFeatures: obj.keyFeatures || '',
      targetAudience: obj.targetAudience || '',
      keywords: obj.keywords || '',
      platform: PLATFORMS_OPT.includes(obj.platform) ? obj.platform : 'shopify',
      tone: TONES_OPT.includes(obj.tone) ? obj.tone : 'professional',
    })
  }
  return rows
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'copygen-sample-template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---- Bulk Results Accordion ----
function BulkResultsSection({ results }) {
  const [openIds, setOpenIds] = useState(new Set())
  const succeeded = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  const toggleRow = (sku) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(sku)) next.delete(sku)
      else next.add(sku)
      return next
    })
  }

  return (
    <div style={{ marginTop: 28 }}>
      {/* Summary bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: 2,
      }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>
            ✓ {succeeded} SUCCEEDED
          </span>
          {failed > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--error)', fontWeight: 700 }}>
              ✗ {failed} FAILED
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            TOTAL: {results.length}
          </span>
        </div>
        <ExportButton results={results} />
      </div>

      {/* Accordion */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderTop: 'none',
        borderRadius: `0 0 ${4}px ${4}px`,
        overflow: 'hidden',
      }}>
        {results.map((r, idx) => {
          const key = r.sku || r.data?.sku || `item-${idx}`
          const isOpen = openIds.has(key)
          const productName = r.data?.productName || r.productName || '—'
          return (
            <div key={key} className="accordion-row">
              <div
                className="accordion-header"
                onClick={() => toggleRow(key)}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  {isOpen
                    ? <ChevronDown size={14} />
                    : <ChevronRight size={14} />
                  }
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  minWidth: 80,
                }}>
                  {key}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {productName}
                </span>
                <span className={`badge ${r.success ? 'badge-success' : 'badge-error'}`}>
                  {r.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>

              {isOpen && (
                <div className="accordion-content">
                  {r.success && r.data ? (
                    <ResultCard data={r.data} />
                  ) : (
                    <div className="error-banner">
                      <AlertCircle size={13} />
                      {r.error || 'Generation failed for this item.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Main BulkInput ----
export default function BulkInput() {
  const [subTab, setSubTab] = useState('csv')
  const [csvText, setCsvText] = useState('')
  const [csvError, setCsvError] = useState(null)
  const [rows, setRows] = useState([newRow()])
  const [globalPlatform, setGlobalPlatform] = useState('')
  const [globalTone, setGlobalTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // ---- CSV tab actions ----
  const handleParseCSV = () => {
    setCsvError(null)
    try {
      const parsed = parseCSV(csvText)
      if (parsed.length === 0) {
        setCsvError('No valid rows found. Check the CSV format.')
        return
      }
      if (parsed.length > MAX_ROWS) {
        setCsvError(`Max ${MAX_ROWS} rows allowed. Found ${parsed.length}.`)
        return
      }
      setRows(parsed)
      setSubTab('manual')
    } catch (err) {
      setCsvError('Failed to parse CSV: ' + err.message)
    }
  }

  // ---- Manual table actions ----
  const handleRowChange = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const handleAddRow = () => {
    if (rows.length >= MAX_ROWS) return
    setRows(prev => [...prev, newRow()])
  }

  const handleDeleteRow = useCallback((id) => {
    setRows(prev => {
      if (prev.length === 1) return [newRow()]
      return prev.filter(r => r.id !== id)
    })
  }, [])

  // ---- Generate all ----
  const handleGenerate = async () => {
    const validRows = rows.filter(r => r.productName.trim())
    if (validRows.length === 0) {
      setError('Add at least one product with a name before generating.')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    setProgress({ current: 0, total: validRows.length })

    const items = validRows.map(r => ({
      sku: r.sku,
      productName: r.productName,
      category: r.category,
      keyFeatures: r.keyFeatures,
      targetAudience: r.targetAudience,
      keywords: r.keywords,
      platform: globalPlatform || r.platform,
      tone: globalTone || r.tone,
    }))

    // Tick progress forward as mockGenerateBulk processes items sequentially
    const progressInterval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        current: Math.min(prev.current + 1, prev.total - 1),
      }))
    }, 500)

    try {
      const json = await mockGenerateBulk({
        items,
        platform: globalPlatform || undefined,
        tone: globalTone || undefined,
      })
      clearInterval(progressInterval)
      setProgress({ current: json.data.total, total: json.data.total })
      setResults(json.data.results)
    } catch (err) {
      clearInterval(progressInterval)
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validCount = rows.filter(r => r.productName.trim()).length
  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="content-enter" style={{ padding: '24px 24px', flex: 1, overflowY: 'auto' }}>

      {/* ---- Sub-tabs: CSV | Manual ---- */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: 20,
      }}>
        <button
          className={`mode-tab ${subTab === 'csv' ? 'active' : ''}`}
          onClick={() => setSubTab('csv')}
        >
          PASTE CSV
        </button>
        <button
          className={`mode-tab ${subTab === 'manual' ? 'active' : ''}`}
          onClick={() => setSubTab('manual')}
        >
          MANUAL ENTRY
        </button>
      </div>

      {/* ============================
          CSV TAB
      ============================= */}
      {subTab === 'csv' && (
        <div>
          {/* Format reference box */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            marginBottom: 14,
          }}>
            <div className="field-label" style={{ marginBottom: 8 }}>// EXPECTED CSV FORMAT</div>
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
{`sku,productName,category,keyFeatures,targetAudience,keywords,platform,tone
SKU001,Widget Pro,Electronics,"Feature 1, Feature 2",Professionals,keyword1,shopify,professional`}
            </pre>
            <div style={{ marginTop: 10 }}>
              <button
                onClick={downloadSampleCSV}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  background: 'var(--surface-3)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                <Download size={12} />
                DOWNLOAD SAMPLE TEMPLATE
              </button>
            </div>
          </div>

          {/* CSV paste area */}
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">// PASTE YOUR CSV</label>
            <textarea
              rows={10}
              value={csvText}
              onChange={e => { setCsvText(e.target.value); setCsvError(null) }}
              placeholder={`Paste your CSV data here...\n\nsku,productName,category,...`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                background: 'var(--surface-1)',
                lineHeight: 1.6,
              }}
            />
          </div>

          {csvError && (
            <div className="error-banner" style={{ marginBottom: 12 }}>
              <AlertCircle size={13} />
              {csvError}
            </div>
          )}

          <button
            onClick={handleParseCSV}
            disabled={!csvText.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              padding: '0 20px',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            PARSE CSV →
          </button>
        </div>
      )}

      {/* ============================
          MANUAL ENTRY TAB
      ============================= */}
      {subTab === 'manual' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <span className="field-label">// PRODUCTS</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: rows.length >= MAX_ROWS ? 'var(--error)' : 'var(--text-muted)',
            }}>
              {rows.length} / {MAX_ROWS} PRODUCTS
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table className="bulk-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>SKU</th>
                  <th style={{ minWidth: 150 }}>Product Name *</th>
                  <th style={{ width: 110 }}>Category</th>
                  <th style={{ minWidth: 140 }}>Key Features</th>
                  <th style={{ minWidth: 120 }}>Target Audience</th>
                  <th style={{ minWidth: 120 }}>Keywords</th>
                  <th style={{ width: 90 }}>Platform</th>
                  <th style={{ width: 100 }}>Tone</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="text"
                        value={row.sku}
                        onChange={e => handleRowChange(row.id, 'sku', e.target.value)}
                        placeholder="SKU-001"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.productName}
                        onChange={e => handleRowChange(row.id, 'productName', e.target.value)}
                        placeholder="Product name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.category}
                        onChange={e => handleRowChange(row.id, 'category', e.target.value)}
                        placeholder="Category"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.keyFeatures}
                        onChange={e => handleRowChange(row.id, 'keyFeatures', e.target.value)}
                        placeholder="Feature 1, Feature 2"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.targetAudience}
                        onChange={e => handleRowChange(row.id, 'targetAudience', e.target.value)}
                        placeholder="e.g. gym-goers"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.keywords}
                        onChange={e => handleRowChange(row.id, 'keywords', e.target.value)}
                        placeholder="keyword 1, keyword 2"
                      />
                    </td>
                    <td>
                      <select
                        value={row.platform}
                        onChange={e => handleRowChange(row.id, 'platform', e.target.value)}
                      >
                        {PLATFORMS_OPT.map(p => (
                          <option key={p} value={p}>{p.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={row.tone}
                        onChange={e => handleRowChange(row.id, 'tone', e.target.value)}
                      >
                        {TONES_OPT.map(t => (
                          <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          background: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: 'var(--radius)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          padding: 0,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--error)'
                          e.currentTarget.style.borderColor = 'var(--error)'
                          e.currentTarget.style.background = 'rgba(255,59,59,0.08)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add row */}
          <button
            type="button"
            onClick={handleAddRow}
            disabled={rows.length >= MAX_ROWS}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 14px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.05em',
              cursor: rows.length >= MAX_ROWS ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: 20,
            }}
            onMouseEnter={e => {
              if (rows.length < MAX_ROWS) e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <Plus size={12} />
            + ADD ROW
          </button>
        </div>
      )}

      {/* ============================
          GLOBAL SETTINGS + GENERATE
      ============================= */}
      <hr className="divider" />

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-end',
        marginBottom: 16,
      }}>
        <div>
          <label className="field-label">PLATFORM OVERRIDE</label>
          <select
            value={globalPlatform}
            onChange={e => setGlobalPlatform(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">— Per Row —</option>
            {PLATFORMS_OPT.map(p => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">TONE OVERRIDE</label>
          <select
            value={globalTone}
            onChange={e => setGlobalTone(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="">— Per Row —</option>
            {TONES_OPT.map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 12 }}>
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {/* Progress indicator */}
      {loading && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--accent)',
              fontWeight: 600,
            }}>
              Processing {progress.current} of {progress.total}...
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="bulk-progress-track">
            <div
              className="bulk-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <button
        className={`generate-btn ${loading ? 'loading' : ''}`}
        onClick={handleGenerate}
        disabled={loading || validCount === 0}
        style={{ maxWidth: 420 }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="spin" />
            GENERATING ALL ({progress.total})...
          </>
        ) : (
          <>GENERATE ALL ({validCount}) DESCRIPTIONS →</>
        )}
      </button>

      {/* ============================
          BULK RESULTS
      ============================= */}
      {results && !loading && (
        <BulkResultsSection results={results} />
      )}

    </div>
  )
}
