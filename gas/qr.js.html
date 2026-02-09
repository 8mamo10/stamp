/**
 * QR Code generation and scanning utilities
 * Uses qrcode.js library for generation
 */

/**
 * Generate QR code for customer identification
 */
function generateCustomerQR(userId) {
  const qrData = {
    type: 'customer',
    userId: userId,
    timestamp: Date.now()
  };
  return JSON.stringify(qrData);
}

/**
 * Generate QR code for reward redemption
 */
function generateRewardQR(rewardCode) {
  const qrData = {
    type: 'reward',
    rewardCode: rewardCode,
    timestamp: Date.now()
  };
  return JSON.stringify(qrData);
}

/**
 * Display QR code on canvas
 */
function displayQR(elementId, data) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('QR element not found:', elementId);
    return;
  }

  // Clear previous QR code
  element.innerHTML = '';

  // Generate QR code using qrcode library
  // Note: Include qrcode.min.js in HTML
  if (typeof QRCode !== 'undefined') {
    new QRCode(element, {
      text: data,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    // Fallback: display data as text
    element.innerHTML = `<div style="padding: 20px; background: #f0f0f0; word-break: break-all;">${data}</div>`;
  }
}

/**
 * Parse QR code data
 */
function parseQRData(dataString) {
  try {
    const data = JSON.parse(dataString);
    return data;
  } catch (error) {
    console.error('Invalid QR data:', error);
    return null;
  }
}

/**
 * Initialize QR scanner
 * Uses html5-qrcode library
 */
function initQRScanner(elementId, onSuccess, onError) {
  if (typeof Html5Qrcode !== 'undefined') {
    const html5QrCode = new Html5Qrcode(elementId);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      onSuccess,
      onError
    ).catch(err => {
      console.error('Error starting QR scanner:', err);
      alert('Unable to start camera. Please check permissions.');
    });

    return html5QrCode;
  } else {
    console.error('html5-qrcode library not loaded');
    return null;
  }
}

/**
 * Stop QR scanner
 */
function stopQRScanner(html5QrCode) {
  if (html5QrCode) {
    html5QrCode.stop().catch(err => {
      console.error('Error stopping QR scanner:', err);
    });
  }
}
