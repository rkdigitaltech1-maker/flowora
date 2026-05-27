/**
 * Affiliate Agreement PDF Generator
 * Generates a downloadable PDF of the affiliate agreement
 * Uses browser-native approach (no external PDF libraries needed)
 */

export interface AgreementData {
  affiliateName: string;
  affiliateEmail: string;
  affiliateCode: string;
  commissionRate: number;
  durationMonths: number;
  acceptedAt: string;
  version: string;
}

/**
 * Generate and download the affiliate agreement as a PDF
 * Uses a print-friendly HTML rendered in a hidden iframe
 */
export function downloadAffiliateAgreementPDF(data: AgreementData): void {
  const htmlContent = generateAgreementHTML(data);


  // Create a hidden iframe for printing
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    // Fallback: open in new window
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.print();
    }
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for content to load then trigger print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Clean up after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };
}


function generateAgreementHTML(data: AgreementData): string {
  const formattedDate = new Date(data.acceptedAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric"
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flowora Affiliate Agreement - ${data.affiliateName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a2e;
      padding: 40px 60px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #6d48ff;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 22pt;
      color: #6d48ff;
      margin-bottom: 5px;
      font-weight: 700;
    }
    .header p {
      font-size: 10pt;
      color: #666;
    }
    .meta-box {
      background: #f8f7fc;
      border: 1px solid #e8e5f2;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .meta-box .item {
      font-size: 9pt;
    }
    .meta-box .item .label {
      font-weight: bold;
      color: #6d48ff;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }
    .meta-box .item .value {
      color: #333;
      font-size: 10pt;
    }
    h2 {
      font-size: 13pt;
      color: #1a1a2e;
      margin: 25px 0 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    h3 {
      font-size: 11pt;
      margin: 15px 0 8px;
      color: #333;
    }
    p, li {
      margin-bottom: 8px;
      text-align: justify;
    }
    ol, ul {
      padding-left: 25px;
    }
    .highlight {
      background: #fff3cd;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 40px;
      border-top: 2px solid #eee;
      padding-top: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .signature-block {
      border-top: 1px solid #333;
      padding-top: 10px;
      margin-top: 60px;
    }
    .signature-block .name {
      font-weight: bold;
      font-size: 10pt;
    }
    .signature-block .role {
      font-size: 9pt;
      color: #666;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 8pt;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
    @media print {
      body { padding: 20px 40px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FLOWORA</h1>
    <p>Affiliate Program Agreement</p>
    <p style="font-size: 9pt; margin-top: 5px;">Version ${data.version} | Effective Date: ${formattedDate}</p>
  </div>

  <div class="meta-box">
    <div class="item">
      <div class="label">Affiliate Name</div>
      <div class="value">${data.affiliateName}</div>
    </div>
    <div class="item">
      <div class="label">Email</div>
      <div class="value">${data.affiliateEmail}</div>
    </div>
    <div class="item">
      <div class="label">Affiliate Code</div>
      <div class="value">${data.affiliateCode}</div>
    </div>
    <div class="item">
      <div class="label">Agreement Date</div>
      <div class="value">${formattedDate}</div>
    </div>
  </div>


  <h2>1. Program Overview</h2>
  <p>This Affiliate Program Agreement ("Agreement") is entered into between <strong>Flowora Technologies Pvt. Ltd.</strong> ("Company") and <strong>${data.affiliateName}</strong> ("Affiliate"). By accepting this agreement, the Affiliate agrees to the following terms and conditions for participation in the Flowora Affiliate Program.</p>

  <h2>2. Commission Structure</h2>
  <p>The Affiliate shall receive a commission of <span class="highlight">${data.commissionRate}%</span> on all qualifying subscription payments made by customers referred through the Affiliate's unique referral link. Commissions are earned on recurring subscription payments for the first <span class="highlight">${data.durationMonths} months</span> of each referred customer's subscription.</p>
  <ul>
    <li>Commission Rate: ${data.commissionRate}% of net subscription amount (excluding taxes)</li>
    <li>Duration: First ${data.durationMonths} consecutive months per referred customer</li>
    <li>Qualifying Plans: All paid subscription plans (Pro Monthly, Pro Annual)</li>
    <li>Commission is calculated on the amount received after payment processing fees</li>
  </ul>

  <h2>3. Referral Tracking & Attribution</h2>
  <ul>
    <li>Attribution is tracked via a 30-day cookie placed when a visitor clicks the Affiliate's unique link</li>
    <li>If the visitor creates an account and subscribes within 30 days of the click, the referral is attributed to the Affiliate</li>
    <li>Only the first affiliate to generate a valid click receives attribution (first-click model)</li>
    <li>Self-referrals are not permitted and will not be credited</li>
  </ul>

  <h2>4. Payment Terms</h2>
  <ul>
    <li>Minimum payout threshold: &#x20B9;500 INR (or $10 USD for international affiliates)</li>
    <li>Payment frequency: Monthly (processed within 15 business days after month-end)</li>
    <li>Payment methods: UPI, PayPal, or direct bank transfer</li>
    <li>Commissions are held for a 30-day verification period before becoming payable</li>
    <li>If a referred customer requests a refund within the refund window, the associated commission is reversed</li>
  </ul>

  <h2>5. Prohibited Activities</h2>
  <p>The following activities are strictly prohibited and may result in immediate termination:</p>
  <ol>
    <li>Self-referrals or creating accounts to generate artificial commissions</li>
    <li>Cookie stuffing, forced clicks, or any form of click fraud</li>
    <li>Bidding on Flowora brand keywords in paid search advertising</li>
    <li>Sending unsolicited emails (spam) or messages containing affiliate links</li>
    <li>Making false or misleading claims about Flowora's features or pricing</li>
    <li>Using coupon/discount code sites without explicit approval</li>
    <li>Any activity that violates applicable laws or regulations</li>
  </ol>


  <h2>6. Content & Promotion Guidelines</h2>
  <ul>
    <li>Affiliate may use Company-provided marketing materials, screenshots, and brand assets</li>
    <li>Affiliate must clearly disclose the affiliate relationship per FTC/ASCI guidelines</li>
    <li>All promotional content must be truthful and not misleading</li>
    <li>Affiliate must not impersonate Flowora or create confusion about official communications</li>
  </ul>

  <h2>7. Intellectual Property</h2>
  <p>The Company grants the Affiliate a limited, non-exclusive, non-transferable license to use Flowora trademarks, logos, and marketing materials solely for the purpose of promoting Flowora through the Affiliate Program. All intellectual property rights remain exclusively with the Company.</p>

  <h2>8. Termination</h2>
  <ul>
    <li>Either party may terminate this Agreement with 30 days written notice</li>
    <li>Company may terminate immediately if Affiliate engages in prohibited activities</li>
    <li>Upon termination, all earned and verified commissions will be paid</li>
    <li>Unverified or pending commissions at time of termination may be forfeited</li>
    <li>Affiliate must cease all promotional activities and remove affiliate links upon termination</li>
  </ul>

  <h2>9. Limitation of Liability</h2>
  <p>The Company's total liability under this Agreement shall not exceed the total commissions paid to the Affiliate in the three (3) months preceding any claim. The Company is not liable for indirect, incidental, special, or consequential damages.</p>

  <h2>10. Modifications</h2>
  <p>The Company reserves the right to modify the terms of this Agreement, including commission rates and program structure, with 30 days advance written notice. Continued participation after the notice period constitutes acceptance of the modified terms.</p>

  <h2>11. Governing Law</h2>
  <p>This Agreement shall be governed by the laws of India. Any disputes arising from this Agreement shall be resolved through binding arbitration in Bangalore, Karnataka, India.</p>

  <h2>12. Confidentiality</h2>
  <p>The Affiliate agrees to keep confidential all non-public information related to the Program, including but not limited to commission rates, conversion data, and internal communications.</p>

  <div class="signature-section">
    <div>
      <div class="signature-block">
        <div class="name">${data.affiliateName}</div>
        <div class="role">Affiliate Partner</div>
        <div class="role">Accepted on: ${formattedDate}</div>
      </div>
    </div>
    <div>
      <div class="signature-block">
        <div class="name">Flowora Technologies Pvt. Ltd.</div>
        <div class="role">Company</div>
        <div class="role">Authorized Representative</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This document was generated electronically and is valid without a physical signature.</p>
    <p>Flowora Technologies Pvt. Ltd. | support@flowora.tech | www.flowora.com</p>
    <p>Agreement Version: ${data.version} | Document ID: AGR-${data.affiliateCode.toUpperCase()}-${Date.now().toString(36).toUpperCase()}</p>
  </div>
</body>
</html>`;
}
