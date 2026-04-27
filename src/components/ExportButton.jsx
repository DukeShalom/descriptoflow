import React from 'react'
import { Download } from 'lucide-react'

function joinArr(arr) {
  if (!arr || !Array.isArray(arr)) return ''
  return arr.join(' | ')
}

function escapeCSV(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export default function ExportButton({ results = [] }) {
  const handleExport = () => {
    const headers = [
      'sku',
      'productName',
      'platform',
      'shopify_title',
      'shopify_metaDesc',
      'shopify_description',
      'shopify_bulletPoints',
      'shopify_tags',
      'amazon_title',
      'amazon_bulletPoints',
      'amazon_description',
      'amazon_searchTerms',
    ]

    const rows = results
      .filter(r => r.success && r.data)
      .map(r => {
        const d = r.data
        return [
          d.sku || '',
          d.productName || '',
          d.platform || '',
          d.shopify?.title || '',
          d.shopify?.metaDescription || '',
          d.shopify?.description || '',
          joinArr(d.shopify?.bulletPoints),
          joinArr(d.shopify?.tags),
          d.amazon?.title || '',
          joinArr(d.amazon?.bulletPoints),
          d.amazon?.description || '',
          joinArr(d.amazon?.searchTerms),
        ].map(escapeCSV).join(',')
      })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `copygen-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const successCount = results.filter(r => r.success).length

  return (
    <button
      onClick={handleExport}
      disabled={successCount === 0}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 18px',
        background: 'var(--surface-2)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.06em',
        cursor: successCount === 0 ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: successCount === 0 ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (successCount > 0) e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <Download size={14} />
      EXPORT ALL TO CSV
    </button>
  )
}
