// ============ HELPERS ============
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const API_BASE_URL = "https://verifai-backend-dun.vercel.app";

// ============ FOOTER YEAR ============
$('#year').textContent = new Date().getFullYear();

// ============ MOBILE MENU ============
const nav = $('#nav');
$('#menuToggle').addEventListener('click', () => nav.classList.toggle('open'));
$$('#nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ============ ACTIVE NAV LINK ON SCROLL ============
const sections = ['home', 'features', 'about', 'contact'].map(id => document.getElementById(id));
const navLinks = $$('#nav a');

window.addEventListener('scroll', () => {
  const pos = window.scrollY + 140;
  let current = 'home';
  sections.forEach(sec => { if (sec && sec.offsetTop <= pos) current = sec.id; });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
});

// ============ MODAL ============
const modal = $('#modal');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');

function openModal(title, html) {
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');

const video = document.getElementById('verifaiVideo');

if (video) {
  video.pause();
  video.currentTime = 0;
}

}
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


// ============ TERMS AND CONDITIONS ============

function termsAndConditions() {

    // Already accepted? Don't show again
    if (localStorage.getItem('verifaiTermsAccepted')) {
        return;
    }

    openModal('Terms & Conditions', `
        <p>By using this website, you agree to the following terms and conditions:</p>

        <ul>
            <li>All content on this website is protected by copyright and may not be reproduced without permission.</li>
        </ul>

        <p>Please read these terms carefully before using the website. If you do not agree to these terms, please refrain from using the website.</p>

        <label>
            <input type="checkbox" id="agreeTerms">
            I agree to Terms & Conditions
        </label>

        <br><br>

       <button id="acceptTermsBtn" class="btn" disabled>
        Accept & Continue
      </button>
    `);

    const checkbox = document.getElementById('agreeTerms');
const acceptBtn = document.getElementById('acceptTermsBtn');

// Initially disabled
acceptBtn.disabled = true;

// Checkbox change event
checkbox.addEventListener('change', function() {
    acceptBtn.disabled =!this.checked;
});
acceptBtn.addEventListener('click', function() {

    localStorage.setItem('verifaiTermsAccepted', 'true');

    termsPopupActive = false;

    closeModal();

});}


// ============ AUTO SHOW AFTER 5 SECONDS ============

window.addEventListener('DOMContentLoaded', function() {

    setTimeout(function() {
        if (!localStorage.getItem('verifaiTermsAccepted')) {
            termsPopupActive = true;
            termsAndConditions();
        }
    }, 5000);

});


// ============ HERO VIDEO ============
function showVideo() {
  openModal('How VERIFAI Works', `
    <p style="margin-bottom:12px">
      1. Choose a tool &nbsp;→&nbsp;
      2. Paste or upload your content &nbsp;→&nbsp;
      3. Get a clear result in seconds.
    </p>

    <div style="aspect-ratio:16/9;background:#0f1d4d;border-radius:10px;overflow:hidden">
      <video
        id="verifaiVideo"
        autoplay
        playsinline
        style="width:100%;height:100%;object-fit:contain;border-radius:10px"
      >
        <source src="assets/vedios/VERIFAI_Tutorial_.mp4" type="video/mp4">
      </video>
    </div>
  `);
}

$('#watchBtn').addEventListener('click', showVideo);

// ============ TOOLS ============
const SCAM_WORDS = ['urgent', 'winner', 'lottery', 'click here', 'verify your account', 'bank', 'otp',
  'password', 'suspended', 'free gift', 'claim now', 'kyc', 'limited time', 'bit.ly', 'prize'];

function analyseText(text) {
  const lower = text.toLowerCase();
  const hits = SCAM_WORDS.filter(w => lower.includes(w));
  const hasLink = /(https?:\/\/|www\.)/i.test(text);
  const score = hits.length + (hasLink ? 1 : 0);
  if (score >= 3) return { cls: 'danger', msg: `⚠️ High risk. Suspicious signals: ${hits.join(', ') || 'link found'}.` };
  if (score >= 1) return { cls: 'warn', msg: `Be careful. Possible signals: ${hits.join(', ') || 'contains a link'}.` };
  return { cls: 'safe', msg: '✅ No obvious scam signals found.' };
}

function textToolHTML(placeholder) {
  return `
    <textarea id="toolInput" placeholder="${placeholder}"></textarea>
    <button class="btn btn-primary" id="analyseBtn">Analyse</button>
    <div id="toolResult"></div>`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function bindAnalyse(type) {
    $('#analyseBtn').addEventListener('click', async () => {
        const text = $('#toolInput').value.trim();
        const out = $('#toolResult');

        if (!text) {
            out.innerHTML = '<div class="result warn">Please enter some content first.</div>';
            return;
        }

        out.innerHTML = `
            <div class="ai-scanning">
                <div class="ai-loader"></div>
                <h3>VERIFAI is Analysing</h3>
                <p>Checking for scams and suspicious signals...</p>
            </div>
        `;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/text/analyse`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text, type })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Analysis failed.');
            }

            const result = data.analysis;
            const score = Math.max(0, Math.min(100, result.riskScore));
            const reasons = result.reasons || [];
            const warnings = result.warningSigns || [];

            out.innerHTML = `
                <div class="image-analysis-card">
                    <div class="analysis-header">
                        <h3>Analysis Result</h3>
                        <span class="analysis-status ${
                            score >= 70 ? 'high' : 'low'
                        }">${escapeHTML(result.classification)}</span>
                    </div>

                    <div class="analysis-score">${score}/100</div>
                    <p>Risk Score</p>

                    <div class="analysis-progress">
                        <div class="analysis-progress-fill"
                             style="width:${score}%"></div>
                    </div>

                    <h4>AI Summary</h4>
                    <p>${escapeHTML(result.summary)}</p>

                    <h4>Reasons</h4>
                    <ul>
                        ${reasons.map(item =>
                            `<li>${escapeHTML(item)}</li>`
                        ).join('')}
                    </ul>

                    <h4>Warning Signs</h4>
                    <ul>
                        ${warnings.map(item =>
                            `<li>${escapeHTML(item)}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;

        } catch (error) {
            out.innerHTML = `
                <div class="result warn">
                    ${escapeHTML(error.message)}
                </div>
            `;

            console.error('VERIFAI Text Analysis Error:', error);
        }
    });
}


function imageToolHTML() {
  return `
    <input type="file" id="imgInput" class="image-file-input" accept="image/*" />
    <button class="btn btn-primary" id="imgBtn">Verify Image</button>
    <div id="toolResult"></div>`;
}

function bindImage() {

  // 1. Show preview immediately after selecting an image
  $('#imgInput').addEventListener('change', () => {

    const file = $('#imgInput').files[0];
    const out = $('#toolResult');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      out.innerHTML = '<div class="result warn">Please select a valid image.</div>';
      return;
    }

    const imageURL = URL.createObjectURL(file);

    out.innerHTML = `
      <div class="image-preview">
        <h3>Selected Image</h3>
        <img src="${imageURL}" alt="Selected image preview"
             style="max-width:250px; width:100%; border-radius:12px;">
        <p>${file.name}</p>
      </div>
    `;
  });


  // 2. Analyze image when button is clicked
  $('#imgBtn').addEventListener('click', async () => {

    const file = $('#imgInput').files[0];
    const out = $('#toolResult');

    if (!file) {
      out.innerHTML = '<div class="result warn">Please choose an image.</div>';
      return;
    }
  out.innerHTML = `
  <div class="ai-scanning">
    <div class="ai-loader"></div>
    <h3>AI is Scanning Your Image</h3>
    <p>Checking image patterns<span class="ai-dots"></span></p>
  </div>
`;
    try {

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/images/detect`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Image analysis failed.');
      }

      const score = Number((data.aiGeneratedScore * 100).toFixed(1));

      out.innerHTML = `
        <div class="image-analysis-card">

          <div class="analysis-header">
            <h3>AI Analysis Result</h3>
            <span>✓ Completed</span>
          </div>

          <div class="analysis-score">${score}%</div>

          <p>AI Generated Probability</p>

          <div class="analysis-progress">
            <div class="analysis-progress-fill"
                 style="width: ${score}%">
            </div>
          </div>

          <div class="analysis-status ${score >= 50 ? 'high' : 'low'}">
            ${score >= 50 ? 'Likely AI Generated' : 'Low AI Score'}
          </div>

          <div class="analysis-file">
            File: ${file.name}
          </div>

          <p>Note: This is an AI detector estimate, not proof of authenticity.</p>

        </div>
      `;

    } catch (error) {

      out.innerHTML = `
        <div class="result warn">${error.message}</div>
      `;

      console.error('VERIFAI Image Error:', error);
    }

  });
}


$$('.open-tool').forEach(btn => {
  btn.addEventListener('click', () => {
    const tool = btn.dataset.tool;
    if (tool === 'AI Image Verification') {
      openModal(tool, imageToolHTML());
      bindImage();
    } else if (tool === 'SMS Scam Detector') {
  openModal(tool, textToolHTML('Paste the SMS message here...'));
  bindAnalyse('sms');
} else {
  openModal(tool, textToolHTML('Paste the email content here...'));
  bindAnalyse('email');
}
  });
});

const feedbackTrack = $('#feedbackTrack');
const feedbackGroup = feedbackTrack?.querySelector('.feedback-group');
if (feedbackTrack && feedbackGroup) {
  const duplicateFeedbackGroup = feedbackGroup.cloneNode(true);
  duplicateFeedbackGroup.setAttribute('aria-hidden', 'true');
  feedbackTrack.appendChild(duplicateFeedbackGroup);
}


