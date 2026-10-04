const input = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const result = document.getElementById('result');
const copyBtn = document.getElementById('copy-btn');
const msg = document.getElementById('msg');

// 입력이 비어 있으면 '단축하기' 비활성화
input.addEventListener('input', () => { shortenBtn.disabled = input.value.trim() === ''; });
input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !shortenBtn.disabled) shorten(); });

function normalize(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { return new URL(url).href; } catch { return null; }
}

// CORS를 허용하는 단축 OpenAPI: spoo.me (바로 이동됨, 실패하면 da.gd로 재시도)
async function viaDagd(url) {
  const res = await fetch('https://da.gd/s?url=' + encodeURIComponent(url));
  const text = (await res.text()).trim();
  if (!res.ok || !/^https?:\/\//.test(text)) throw new Error(text || 'da.gd 오류');
  return text;
}
async function viaSpoo(url) {
  const res = await fetch('https://spoo.me/', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'url=' + encodeURIComponent(url)
  });
  const data = await res.json();
  if (!res.ok || !data.short_url) throw new Error('spoo.me 오류');
  return data.short_url.replace(/^http:/, 'https:');
}

async function shorten() {
  const url = normalize(input.value);
  msg.className = 'msg';
  if (!url) { msg.textContent = '올바른 URL을 입력해 주세요.'; return; }
  shortenBtn.disabled = true;
  shortenBtn.textContent = '단축 중...';
  msg.textContent = '';
  try {
    let short;
    try { short = await viaSpoo(url); } catch { short = await viaDagd(url); }
    result.value = short;
    copyBtn.disabled = false;
    msg.className = 'msg ok';
    msg.textContent = '단축 완료!';
  } catch (e) {
    result.value = '';
    copyBtn.disabled = true;
    msg.textContent = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    shortenBtn.textContent = '단축하기';
    shortenBtn.disabled = input.value.trim() === '';
  }
}
shortenBtn.addEventListener('click', shorten);

// '복사' → 클립보드 복사 후 알림
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(result.value);
  } catch {
    result.select();
    document.execCommand('copy');
  }
  alert('복사하였습니다');
});
