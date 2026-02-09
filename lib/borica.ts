import crypto from "crypto";

// BORICA APGW configuration
const BORICA_GATEWAY_URL =
  process.env.BORICA_GATEWAY_URL || "https://3dsgate-dev.borica.bg/cgi-bin/cgi_link";

const BORICA_MID = process.env.BORICA_MID || "";
const BORICA_TID = process.env.BORICA_TID || "";

function getPrivateKey(): string {
  let key = process.env.BORICA_PRIVATE_KEY || "";
  if (!key) {
    console.error("Private key is missing. Ensure BORICA_PRIVATE_KEY is set.");
    return "";
  }

  // Convert literal \n to actual newlines
  key = key.replace(/\\n/g, "\n");

  // Format PEM-encoded key if it is on a single line
  if (key.includes("-----BEGIN") && key.indexOf("\n") === -1) {
    key = key
      .replace(/(-----BEGIN [A-Z ]+-----)/, "$1\n")
      .replace(/(-----END [A-Z ]+-----)/, "\n$1");
    const match = key.match(
      /(-----BEGIN [A-Z ]+-----)\n([\s\S]+)\n(-----END [A-Z ]+-----)/
    );
    if (match) {
      const body = match[2].replace(/\s/g, "");
      const formattedBody = body.match(/.{1,64}/g)?.join("\n") || body;
      key = `${match[1]}\n${formattedBody}\n${match[3]}`;
    }
  }

  // Support base64-encoded PEM
  if (!key.includes("-----BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      if (decoded.includes("-----BEGIN")) {
        key = decoded;
      }
    } catch (error) {
      console.warn("Key is not base64-encoded. Proceeding with original value.");
    }
  }

  return key.trim();
}

export function diagnoseBoricaSetup(): {
  midSet: boolean;
  tidSet: boolean;
  keySet: boolean;
  keyFormat: string;
  passwordSet: boolean;
  signTest: string;
} {
  const key = getPrivateKey();
  const password = getPrivateKeyPassword();

  let keyFormat = "empty";
  if (key) {
    if (key.includes("ENCRYPTED PRIVATE KEY")) keyFormat = "encrypted-pkcs8";
    else if (key.includes("RSA PRIVATE KEY")) keyFormat = "rsa-pem";
    else if (key.includes("PRIVATE KEY")) keyFormat = "pkcs8";
    else keyFormat = "unknown";
  }

  let signTest = "not-tested";
  if (key) {
    try {
      const keyObj = decryptPrivateKey();
      const sign = crypto.createSign("SHA256");
      sign.update("test", "utf-8");
      sign.end();
      sign.sign(keyObj, "hex");
      signTest = "ok";
    } catch (err) {
      signTest = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    midSet: !!BORICA_MID,
    tidSet: !!BORICA_TID,
    keySet: !!key,
    keyFormat,
    passwordSet: !!password,
    signTest,
  };
}

function getPrivateKeyPassword(): string {
  return process.env.BORICA_PRIVATE_KEY_PASSWORD || "";
}

let orderCounter = Math.floor(Math.random() * 900000) + 100000;
export function generateOrderId(): string {
  orderCounter++;
  return String(orderCounter).padStart(6, "0").slice(-6);
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

export function formatAmount(amountBGN: number): string {
  const amountEUR = amountBGN / 1.9558; // Hardcoded BGN to EUR conversion rate
  return amountEUR.toFixed(2);
}

export function getTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const h = now.getHours().toString().padStart(2, "0");
  const min = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  return `${y}${m}${d}${h}${min}${s}`;
}

function buildMacGeneralMessage(fields: Record<string, string>, fieldOrder: string[]): string {
  let msg = "";
  for (const field of fieldOrder) {
    const value = fields[field] || "-";
    msg += value === "-" ? "-" : value.length.toString() + value;
  }
  return msg;
}

function decryptPrivateKey(): crypto.KeyObject {
  const pem = getPrivateKey();
  const password = getPrivateKeyPassword();

  try {
    return crypto.createPrivateKey({ key: pem, format: "pem", passphrase: password });
  } catch (err1) {
    try {
      return crypto.createPrivateKey({ key: Buffer.from(pem, "utf-8"), passphrase: Buffer.from(password, "utf-8") });
    } catch (err2) {
      try {
        return crypto.createPrivateKey({ key: pem, format: "pem" });
      } catch (finalError) {
        throw new Error(
          `Cannot decrypt private key: ${String(finalError)}`
        );
      }
    }
  }
}

function signMessage(message: string): string {
  try {
    const keyObject = decryptPrivateKey();
    const sign = crypto.createSign("SHA256");
    sign.update(message, "utf-8");
    sign.end();
    return sign.sign(keyObject, "hex").toUpperCase();
  } catch (err) {
    throw new Error(
      `[Signing Error]: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export interface PaymentFormData {
  gatewayUrl: string;
  fields: Record<string, string>;
}

export function createPaymentRequest(params: {
  orderId: string;
  amountBGN: number;
  description: string;
  backref: string;
  email?: string;
}): PaymentFormData {
  const { orderId, amountBGN, description, backref, email } = params;
  const amount = formatAmount(amountBGN);
  const timestamp = getTimestamp();
  const nonce = generateNonce();

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
  };

  const fieldOrder = [
    "TERMINAL",
    "TRTYPE",
    "AMOUNT",
    "CURRENCY",
    "ORDER",
    "MERCHANT",
    "TIMESTAMP",
    "NONCE",
  ];

  const message = buildMacGeneralMessage(fields, fieldOrder);
  fields.P_SIGN = signMessage(message);

  return {
    gatewayUrl: BORICA_GATEWAY_URL,
    fields,
  };
}

export function verifyPaymentResponse(responseFields: Record<string, string>): boolean {
  const actionCode = responseFields.ACTION || responseFields.ACTION_CODE || "";
  return actionCode === "0";
}

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
  };
}

export function isBoricaConfigured(): boolean {
  return !!(BORICA_MID && BORICA_TID && getPrivateKey());
}
