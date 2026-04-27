// Mock API — used when no backend is available (e.g. GitHub Pages)

function buildMockData({ sku, productName, category, keyFeatures, targetAudience, keywords, platform, tone }) {
  const kws = (keywords || productName).split(',').map(k => k.trim()).filter(Boolean)
  const audience = targetAudience || 'discerning customers'
  const cat = category || 'product'
  const feat = keyFeatures || 'premium quality, durable construction, easy to use'

  const shopify = {
    title: `${productName} — Premium ${cat} | Fast Shipping & Easy Returns`,
    metaDescription: `Shop ${productName}. ${feat.split(',')[0]?.trim() || 'Top-rated'}. Free shipping & 30-day returns. ${kws[0] || 'Best value'} guaranteed.`.slice(0, 155),
    description: `<p>Introducing the <strong>${productName}</strong> — the go-to choice for ${audience}. Engineered with care and built for real-world performance, this ${cat} delivers results you can count on.</p><p>Featuring ${feat}, it stands apart from the competition. Whether you're a first-time buyer or a seasoned pro, you'll appreciate the difference.</p><p>Join thousands of happy customers who've made the switch. Order today with confidence — backed by our 30-day money-back guarantee.</p>`,
    bulletPoints: [
      `PREMIUM QUALITY: Crafted from top-grade materials for lasting durability`,
      `DESIGNED FOR ${audience.toUpperCase()}: Meets the exact needs of your lifestyle`,
      `EASY SETUP: Ready to use straight out of the box — zero hassle`,
      `VERSATILE USE: Perfect for ${cat} and a wide range of everyday applications`,
      `SATISFACTION GUARANTEED: 30-day money-back guarantee, no questions asked`,
    ],
    tags: [...kws, 'free shipping', 'top rated', 'best seller', 'quality guaranteed'].slice(0, 10),
  }

  const amazon = {
    title: `${productName} for ${audience} — Premium ${cat} with ${feat.split(',')[0]?.trim() || 'Advanced Features'} (${kws[0] || 'Top Pick'})`.slice(0, 200),
    bulletPoints: [
      `SUPERIOR PERFORMANCE — ${productName} delivers consistent, professional-grade results every time`,
      `BUILT FOR ${audience.toUpperCase()} — Engineered around the real needs of your daily routine`,
      `DURABLE CONSTRUCTION — Premium materials that hold up to heavy everyday use`,
      `INTUITIVE DESIGN — Get up and running in minutes with zero learning curve`,
      `BACKED BY WARRANTY — Purchase confidently with full manufacturer support included`,
    ],
    description: `The ${productName} is engineered for ${audience} who refuse to compromise. Featuring ${feat}, this ${cat} outperforms the competition in every category. Compact, reliable, and built to last. ${kws.length ? `Ideal for ${kws.slice(0, 2).join(' and ')} enthusiasts.` : ''} Order now and see why thousands choose ${productName}.`,
    searchTerms: [...kws, productName.toLowerCase()].slice(0, 5),
  }

  const p = platform?.toLowerCase()
  return {
    sku: sku || 'DEMO-001',
    productName,
    platform: p,
    tone: tone || 'professional',
    ...(p === 'shopify' || p === 'both' ? { shopify } : {}),
    ...(p === 'amazon' || p === 'both' ? { amazon } : {}),
    mock: true,
    generatedAt: new Date().toISOString(),
  }
}

// Simulate network delay for realism
const delay = (ms) => new Promise(r => setTimeout(r, ms))

export async function mockGenerate(payload) {
  await delay(900 + Math.random() * 600)
  return { success: true, data: buildMockData(payload) }
}

export async function mockGenerateBulk({ items, platform, tone }) {
  const results = []
  for (const item of items) {
    await delay(400 + Math.random() * 300)
    const p = item.platform || platform || 'shopify'
    const t = item.tone || tone || 'professional'
    results.push({
      sku: item.sku || 'DEMO',
      success: true,
      data: buildMockData({ ...item, platform: p, tone: t }),
    })
  }
  const succeeded = results.filter(r => r.success).length
  return {
    success: true,
    data: { total: results.length, succeeded, failed: results.length - succeeded, results },
  }
}
