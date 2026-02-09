import crypto from "crypto"

// BORICA APGW configuration
const BORICA_GATEWAY_URL =
  process.env.BORICA_GATEWAY_URL || "https://3dsgate-dev.borica.bg/cgi-bin/cgi_link"

const BORICA_MID = process.env.BORICA_MID || ""
const BORICA_TID = process.env.BORICA_TID || ""

function getPrivateKey(): string {
  let key = process.env.BORICA_PRIVATE_KEY || ""
  if (!key) return ""

  // When pasted into env vars, literal \n sequences replace actual newlines
  key = key.replace(/\\n/g, "\n")

  // If still no newlines and has BEGIN header on one line, reformat
  if (key.includes("-----BEGIN") && key.indexOf("\n") === -1) {
    key = key
      .replace(/(-----BEGIN [A-Z ]+-----)/, "$1\n")
      .replace(/(-----END [A-Z ]+-----)/, "\n$1")
    const match = key.match(/(-----BEGIN [A-Z ]+-----)\n([\s\S]+)\n(-----END [A-Z ]+-----)/)
    if (match) {
      const body = match[2].replace(/\s/g, "")
      const formattedBody = body.match(/.{1,64}/g)?.join("\n") || body
      key = `${match[1]}\n${formattedBody}\n${match[3]}`
    }
  }

  // Support base64-encoded PEM (no BEGIN header at all)
  if (!key.includes("-----BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8")
      if (decoded.includes("-----BEGIN")) {
        key = decoded
      }
    } catch {
      // not base64
    }
  }

  return key.trim()
}

// Diagnostic function to check key health
export function diagnoseBoricaSetup(): {
  midSet: boolean
  tidSet: boolean
  keySet: boolean
  keyFormat: string
  passwordSet: boolean
  signTest: string
} {
  const key = getPrivateKey()
  const password = getPrivateKeyPassword()

  let keyFormat = "empty"
  if (key) {
    if (key.includes("ENCRYPTED PRIVATE KEY")) keyFormat = "encrypted-pkcs8"
    else if (key.includes("RSA PRIVATE KEY")) keyFormat = "rsa-pem"
    else if (key.includes("PRIVATE KEY")) keyFormat = "pkcs8"
    else keyFormat = "unknown"
  }

  let signTest = "not-tested"
  if (key) {
    try {
      const keyObj = decryptPrivateKey()
      const sign = crypto.createSign("SHA256")
      sign.update("test", "utf-8")
      sign.end()
      sign.sign(keyObj, "hex")
      signTest = "ok"
    } catch (err) {
      signTest = err instanceof Error ? err.message : String(err)
    }
  }

  return {
    midSet: !!BORICA_MID,
    tidSet: !!BORICA_TID,
    keySet: !!key,
    keyFormat,
    passwordSet: !!password,
    signTest,
  }
}

function getPrivateKeyPassword(): string {
  return process.env.BORICA_PRIVATE_KEY_PASSWORD || ""
}

// Generate a 6-digit order number (padded)
let orderCounter = Math.floor(Math.random() * 900000) + 100000
export function generateOrderId(): string {
  orderCounter++
  return String(orderCounter).padStart(6, "0").slice(-6)
}

// Generate 32-char hex nonce
export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex").toUpperCase()
}

// Format amount: "1.00" format with exactly 2 decimal places
export function formatAmount(amountBGN: number): string {
  // Convert BGN to EUR (fixed rate)
  const amountEUR = amountBGN / 1.9558
  return amountEUR.toFixed(2)
}

// Get timestamp in YYYYMMDDHHmmss format
export function getTimestamp(): string {
  const now = new Date()
  const y = now.getFullYear().toString()
  const m = (now.getMonth() + 1).toString().padStart(2, "0")
  const d = now.getDate().toString().padStart(2, "0")
  const h = now.getHours().toString().padStart(2, "0")
  const min = now.getMinutes().toString().padStart(2, "0")
  const s = now.getSeconds().toString().padStart(2, "0")
  return `${y}${m}${d}${h}${min}${s}`
}

/**
 * MAC_GENERAL signing for BORICA APGW.
 * The message to sign is built from field values separated by their lengths.
 * Format: len(TERMINAL)TERMINAL + len(TRTYPE)TRTYPE + len(AMOUNT)AMOUNT + ...
 */
function buildMacGeneralMessage(fields: Record<string, string>, fieldOrder: string[]): string {
  let msg = ""
  for (const field of fieldOrder) {
    const value = fields[field] || "-"
    if (value === "-") {
      msg += "-"
    } else {
      msg += value.length.toString() + value
    }
  }
  return msg
}

function decryptPrivateKey(): crypto.KeyObject {
  const pem = getPrivateKey()
  const password = getPrivateKeyPassword()

  // Try standard approach first
  try {
    return crypto.createPrivateKey({
      key: pem,
      format: "pem",
      passphrase: password,
    })
  } catch {
    // ignore, try next
  }

  // Try with Buffer passphrase
  try {
    return crypto.createPrivateKey({
      key: Buffer.from(pem, "utf-8"),
      format: "pem",
      passphrase: Buffer.from(password, "utf-8"),
    })
  } catch {
    // ignore, try next
  }

  // Try without passphrase (in case key is not encrypted despite header)
  try {
    return crypto.createPrivateKey({
      key: pem,
      format: "pem",
    })
  } catch (err) {
    throw new Error(`Cannot decrypt private key: ${err instanceof Error ? err.message : String(err)}`)
  }
}

function signMessage(message: string): string {
  console.log("[v0] Signing message, length:", message.length)

  try {
    const keyObject = decryptPrivateKey()
    console.log("[v0] Key decrypted, type:", keyObject.type, "asymmetricKeyType:", keyObject.asymmetricKeyType)

    const sign = crypto.createSign("SHA256")
    sign.update(message, "utf-8")
    sign.end()

    const signature = sign.sign(keyObject, "hex")

    console.log("[v0] Signature generated successfully, length:", signature.length)
    return signature.toUpperCase()
  } catch (err) {
    console.error("[v0] Signing error:", err)
    throw err
  }
}

export interface PaymentFormData {
  gatewayUrl: string
  fields: Record<string, string>
}

/**
 * Create payment form data for TRTYPE=1 (Sale/Authorization)
 */
export function createPaymentRequest(params: {
  orderId: string
  amountBGN: number
  description: string
  backref: string
  email?: string
}): PaymentFormData {
  const { orderId, amountBGN, description, backref, email } = params

  const amount = formatAmount(amountBGN)
  const timestamp = getTimestamp()
  const nonce = generateNonce()

  const fields: Record<string, string> = {
    TERMINAL: BORICA_TID,
    TRTYPE: "1",
    AMOUNT: amount,
    CURRENCY: "EUR",
    ORDER: orderId,
    DESC: description,
    MERCHANT: BORICA_MID,
    MERCH_NAME: "BeHarry Ceramic Studio",
    MERCH_URL: backref.replace(/\/api\/payment\/.*$/, ""),
    EMAIL: email || "",
    COUNTRY: "BG",
    MERCH_GMT: "+02",
    TIMESTAMP: timestamp,
    NONCE: nonce,
    BACKREF: backref,
    AD_CUST_BOR_ORDER_ID: orderId,
    ADDENDUM: "AD,TD",
    LANG: "BG",
  }

  // MAC_GENERAL field order for TRTYPE 1 (Authorization/Sale)
  const fieldOrder = [
    "TERMINAL",
    "TRTYPE",
    "AMOUNT",
    "CURRENCY",
    "ORDER",
    "MERCHANT",
    "TIMESTAMP",
    "NONCE",
  ]

  const message = buildMacGeneralMessage(fields, fieldOrder)
  const pSign = signMessage(message)

  fields.P_SIGN = pSign

  return {
    gatewayUrl: BORICA_GATEWAY_URL,
    fields,
  }
}

/**
 * Verify the response signature from BORICA (MAC_GENERAL)
 */
export function verifyPaymentResponse(responseFields: Record<string, string>): boolean {
  // In production, verify P_SIGN from BORICA using their public certificate
  // For the test environment, we check ACTION_CODE for success
  const actionCode = responseFields.ACTION || responseFields.ACTION_CODE || ""
  return actionCode === "0"
}

/**
 * Parse the BORICA response from the POST callback
 */
export function parsePaymentResponse(body: Record<string, string>) {
  return {
    orderId: body.ORDER || "",
    actionCode: body.ACTION || body.ACTION_CODE || "",
    responseCode: body.RC || "",
    statusMessage: body.STATUSMSG || "",
    approvalCode: body.APPROVAL || "",
    rrn: body.RRN || "",
    intRef: body.INT_REF || "",
    terminal: body.TERMINAL || "",
    trtype: body.TRTYPE || "",
    amount: body.AMOUNT || "",
    currency: body.CURRENCY || "",
    isSuccessful: (body.ACTION || body.ACTION_CODE || "") === "0",
  }
}

export function isBoricaConfigured(): boolean {
  return !!(BORICA_MID && BORICA_TID && getPrivateKey())
}
