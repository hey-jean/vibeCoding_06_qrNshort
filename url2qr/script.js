const app = document.getElementById('app');
const form = document.getElementById('url-form');
const input = document.getElementById('url-input');
const qrArea = document.getElementById('qr-area');
const qrBox = document.getElementById('qrcode');
const errorEl = document.getElementById('error');

// 마우스 위치에 따라 그라데이션 색이 바뀌게
document.addEventListener('mousemove', (e) => {
  document.documentElement.style.setProperty('--x', (e.clientX / window.innerWidth * 100) + '%');
  document.documentElement.style.setProperty('--y', (e.clientY / window.innerHeight * 100) + '%');
});

function normalize(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { return new URL(url).href; } catch { return null; }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = normalize(input.value);
  if (!url) {
    errorEl.textContent = '올바른 URL을 입력해 주세요.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  try {
    qrBox.innerHTML = '';
    new QRCode(qrBox, { text: url, width: 240, height: 240, colorDark: '#3b2f12', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
    qrBox.title = '클릭하면 JPG로 저장돼요'; // 라이브러리가 넣는 URL 툴팁 대신 안내 문구
    qrArea.hidden = false;
    app.classList.add('done'); // 입력창은 아래로, QR은 가운데로
  } catch (err) {
    errorEl.textContent = 'QR코드 생성 중 오류가 발생했습니다.';
    errorEl.hidden = false;
  }
});

// QR코드 클릭 → JPG 다운로드 (흰 여백 포함)
function downloadJpg() {
  const src = qrBox.querySelector('canvas') || qrBox.querySelector('img');
  if (!src) return;
  const pad = 24, size = 240;
  const c = document.createElement('canvas');
  c.width = c.height = size + pad * 2;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(src, pad, pad, size, size);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/jpeg', 0.95);
  a.download = 'qrcode.jpg';
  a.click();
}
qrBox.addEventListener('click', downloadJpg);
qrBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); downloadJpg(); } });
