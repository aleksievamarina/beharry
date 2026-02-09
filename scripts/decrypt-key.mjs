// This script decrypts the BORICA encrypted private key using legacy OpenSSL provider
// Run with: node --openssl-legacy-provider scripts/decrypt-key.mjs

import crypto from 'crypto'

const ENCRYPTED_KEY = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIFDTA/BgkqhkiG9w0BBQ0wMjAaBgkqhkiG9w0BBQwwDQQIvgF/p96ZVToCAWQw
FAYIKoZIhvcNAwcECGIZRgUcVuVBBIIEyD8ZPKtL/R2aI13DEOTWT4xFgkXDg3Fm
VHpGaQJ/Yl4YyJJMTLXjbfXTYc3wqixeIP+O9jMQR/vg/ZgkNOUhn/UHmewGVxVj
TAW+l2SaBI6JfV5V1OFqLOz1FgYdVjTWJiDoyC59bYqhv5DHHUims3h/S7OYaswc
-----END ENCRYPTED PRIVATE KEY-----`

const PASSWORD = 'AEVLOGIEVA'

try {
  const keyObject = crypto.createPrivateKey({
    key: ENCRYPTED_KEY,
    format: 'pem',
    passphrase: PASSWORD,
  })

  const decryptedPem = keyObject.export({
    type: 'pkcs8',
    format: 'pem',
  })

  console.log('=== DECRYPTED PRIVATE KEY ===')
  console.log(decryptedPem)
  console.log('=== END ===')
  console.log('')
  console.log('Copy the key above (including BEGIN/END lines) and set it as BORICA_PRIVATE_KEY env variable.')
} catch (err) {
  console.error('Failed to decrypt:', err.message)
  console.log('')
  console.log('Try running with: node --openssl-legacy-provider scripts/decrypt-key.mjs')
}
