export const encryptText = async (password, plaintext) => {
  const enc = new TextEncoder();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // derive key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 200000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );

  const cipherBytes = new Uint8Array(ciphertext);

  // combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + cipherBytes.length);

  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(cipherBytes, salt.length + iv.length);

  // convert to base64 string
  return btoa(String.fromCharCode(...combined));
};

export const decryptText = async (password, data) => {
  const dec = new TextDecoder();

  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ciphertext = bytes.slice(28);

  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 200000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return dec.decode(plaintextBuffer);
};
