export const verifyDeviceOwnership = async () => {
  if (!window.PublicKeyCredential) {
    return true;
  }

  try {
    const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    
    if (!isAvailable) {
      return true;
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Voting System" },
        user: {
          id: window.crypto.getRandomValues(new Uint8Array(16)),
          name: "voter",
          displayName: "Voter Verification"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000
      }
    });

    return !!credential;
  } catch (error) {
    return false;
  }
};