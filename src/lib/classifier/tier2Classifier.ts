/**
 * Tier 2 — zero-shot classification via Hugging Face Inference API.
 *
 * Model: MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 (multilingual NLI,
 * mencakup Bahasa Indonesia). BUKAN model IndoBERT khusus Indonesia — sudah dicoba
 * StevenLimcorn/indo-roberta-indonli dan LazarusNLP/indobert-lite-base-p1-indonli-distil-mdeberta
 * (dua-duanya genuinely IndoBERT-based), tapi keduanya tidak di-host provider hf-inference
 * di free tier ("Model not supported by provider hf-inference") — dicek langsung ke API,
 * bukan asumsi. Model ini satu-satunya yang lolos filter resmi HF
 * (inference=warm + pipeline_tag=zero-shot-classification + language=id).
 *
 * Endpoint router.huggingface.co/hf-inference/... — domain lama api-inference.huggingface.co
 * sudah tidak resolve sama sekali (bagian dari restrukturisasi "Inference Providers" HF).
 */

const HF_MODEL = 'MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7'
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`

export interface Tier2ClassificationResult {
  label: string
  score: number
}

interface HuggingFaceZeroShotEntry {
  label: string
  score: number
}

export async function classifyWithTier2(
  text: string,
  candidateLabels: string[]
): Promise<Tier2ClassificationResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY belum di-set di environment variables')
  }

  const body = JSON.stringify({
    inputs: text,
    parameters: { candidate_labels: candidateLabels },
  })

  const attempt = () =>
    fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    })

  let response = await attempt()

  // Model kadang "cold" (belum di-load provider) — retry sekali setelah jeda singkat.
  if (response.status === 503) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    response = await attempt()
  }

  if (!response.ok) {
    return null
  }

  const result = (await response.json()) as HuggingFaceZeroShotEntry[] | { error: string }

  if (!Array.isArray(result) || result.length === 0) {
    return null
  }

  return { label: result[0].label, score: result[0].score }
}
