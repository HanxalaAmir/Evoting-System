export const verifyDeviceOwnership = async () => {
  // 1. Check if the browser supports WebAuthn
  if (!window.PublicKeyCredential) {
    console.warn("WebAuthn not supported on this device. Skipping biometric check.");
    return true; // Fallback to allow voting on older devices
  }

  try {
    // 2. Check if a platform authenticator (TouchID/FaceID) is available
    const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    
    if (!isAvailable) {
      console.warn("No biometric authenticator available.");
      return true; // Fallback if hardware is missing
    }

    // 3. Generate a random challenge (In a full implementation, this comes from the backend)
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // 4. Request User Verification (The Browser Prompt)
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname, // Ensures request is for this domain
        timeout: 60000,
        userVerification: "required", // Forces the PIN/Biometric prompt
      },
    });

    return !!assertion; // Returns true if the user passed the prompt
  } catch (error) {
    console.error("Device authentication failed or cancelled:", error);
    return false; // Blocks the vote if the user cancels or fails the prompt
  }
};