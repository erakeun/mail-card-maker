// Run with PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE if not installed normally.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const results = path.join(root, 'test-results');
fs.mkdirSync(results, { recursive: true });
const report = { checks: [], errors: [] };
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(root, `.${name === '/' ? '/index.html' : name}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.webp':'image/webp' };
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
const check = (name, details) => { report.checks.push({name, details}); console.log('PASS', name); };
let context;
async function launch() {
  context = await chromium.launchPersistentContext(path.join(results, 'browser-profile'), {
    executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true, viewport: { width: 1440, height: 1100 }, acceptDownloads: true
  });
  await context.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  return context;
}
async function ready(page) { await page.waitForFunction(() => appReady && !isTemplateLoading && !isCharacterLoading); }
async function change(page, id, value) {
  await page.locator('#' + id).evaluate((node, value) => { node.value = value; node.dispatchEvent(new Event('input', {bubbles:true})); node.dispatchEvent(new Event('change', {bubbles:true})); }, String(value));
}
async function download(page, selector, target) {
  const pending = page.waitForEvent('download');
  await page.click(selector);
  const file = await pending;
  await file.saveAs(path.join(results, target));
  return file;
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  await launch();
  let page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const dotRequests = [];
  page.on('request', request => { if (request.url().includes('/dot-chars/')) dotRequests.push(request.url()); });
  await page.goto(base);
  await page.evaluate(async () => { localStorage.clear(); await draftDB('delete'); });
  await page.reload();
  await ready(page);
  assert.equal(dotRequests.length, 0);
  check('initial dot image requests = 0');
  const feedback = await page.locator('[data-mach-feedback]').getAttribute('href');
  assert(feedback.includes('tool=01'));
  assert.equal(await page.locator('#templateOptions input').count(), 7);
  assert.equal(await page.evaluate(() => characters.filter(c => !c.isDot).length), 98);
  check('7 templates, 98 ordinary characters and feedback preserved', feedback);
  await page.fill('#name', '가상하늘');
  await page.fill('#email', 'sample@example.test');
  await page.fill('#team', '가상대학교 | 도트 연구팀');
  await page.fill('#phone', '000-0000-0000');
  await page.fill('#address', '가상시 샘플로 65');
  for (const [category, count] of [['dot-hanyangi',41],['dot-hibibi',24]]) {
    await page.selectOption('#category', category);
    await ready(page);
    assert.equal(await page.locator('.dot-pose').count(), count);
    assert.equal(await page.locator('#character option').count(), count+1);
    assert(await page.locator('.dot-pose').first().textContent());
    check(category + ' thumbnail/pose count', count);
  }
  assert(dotRequests.length < 65, 'only needed thumbnails load');
  check('category thumbnail loading stays lazy', { unique: new Set(dotRequests).size });
  await page.selectOption('#character','assets/dot-chars/haibibi-24.png');
  await ready(page);
  const wide = await page.evaluate(() => ({ w: selectedCharImg.naturalWidth, h:selectedCharImg.naturalHeight }));
  assert(wide.w > wide.h);
  await change(page,'charOffsetX',-80);
  await change(page,'charOffsetY',45);
  await change(page,'charScale',135);
  await page.check('#charFlip');
  const drawEvidence = await page.evaluate(() => {
    const calls = [];
    const original = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
      if (image === selectedCharImg) calls.push({args, smoothing:this.imageSmoothingEnabled, scaleX:this.getTransform().a});
      return original.call(this,image,...args);
    };
    try { renderCard(canvas); } finally { CanvasRenderingContext2D.prototype.drawImage = original; }
    return calls[0];
  });
  assert.equal(drawEvidence.smoothing,false);
  assert(drawEvidence.scaleX < 0);
  assert(Math.abs(drawEvidence.args[6]/drawEvidence.args[7]-wide.w/wide.h) < 0.00001);
  check('wide pose renders with preserved ratio, nearest-neighbor and flip',drawEvidence);
  await page.locator('#characterControls').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(results,'mail-dot-editor.png'),fullPage:true});
  await page.locator('#canvas').screenshot({path:path.join(results,'mail-dot-preview.png')});
  await change(page,'exportWidth',750);
  await download(page,'#downloadBtn','mail-dot-750.png');
  await change(page,'exportWidth',5000);
  await download(page,'#downloadBtn','mail-dot-5000.png');
  for (const width of [750,5000]) {
    const bytes = fs.readFileSync(path.join(results,`mail-dot-${width}.png`));
    const info = await page.evaluate(async data => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + data;
      await image.decode();
      const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
      const ctx=c.getContext('2d');ctx.drawImage(image,0,0);
      return {width:image.naturalWidth,height:image.naturalHeight,alpha:ctx.getImageData(0,0,1,1).data[3]};
    }, bytes.toString('base64'));
    assert.equal(info.width,width); assert.equal(info.height,Math.round(width*706/2048));
    check('actual PNG download/reopen '+width, info);
  }
  await download(page,'#saveDraftBtn','mail-dot-project.json');
  const saved = JSON.parse(fs.readFileSync(path.join(results,'mail-dot-project.json'),'utf8'));
  assert.equal(saved.state.character,'assets/dot-chars/haibibi-24.png');
  assert.equal(saved.state.charFlip,true);
  await page.selectOption('#category','hanyangi'); await ready(page);
  await page.locator('#draftFile').setInputFiles(path.join(results,'mail-dot-project.json'));
  await page.waitForFunction(() => !draftRestoring && elCharacter.value === 'assets/dot-chars/haibibi-24.png');
  await ready(page);
  assert.equal(await page.locator('#charScale').inputValue(),'135');
  assert.equal(await page.locator('#charOffsetX').inputValue(),'-80');
  assert(await page.locator('#charFlip').isChecked());
  check('JSON reopen restores selected pose, scale, position, flip');
  await page.selectOption('#category','dot-hanyangi'); await ready(page);
  const textPose = await page.evaluate(() => characters.find(c=>c.isDot && c.hasText).file);
  await page.selectOption('#character',textPose); await ready(page);
  assert(await page.locator('#charFlipWarning').isVisible());
  check('text-pose flip warning');
  await page.click('#clearCharacterBtn');
  assert.equal(await page.evaluate(() => selectedCharImg),null);
  assert.equal(await page.locator('#character').inputValue(),'');
  await page.selectOption('#character','assets/dot-chars/hanyangyi-01.png');
  await page.selectOption('#character','assets/dot-chars/hanyangyi-41.png');
  await ready(page);
  assert((await page.locator('#charPreview').getAttribute('src')).includes('hanyangyi-41'));
  check('deselect and rapid replacement end on requested pose');
  await page.fill('#name','가상즉시복원');
  await change(page,'charOffsetY',77);
  await page.close();
  page=await context.newPage(); await page.goto(base); await ready(page);
  assert.equal(await page.locator('#name').inputValue(),'가상즉시복원');
  assert.equal(await page.locator('#charOffsetY').inputValue(),'77');
  check('immediate tab close/reopen preserves final edit');
  await context.close();
  await launch(); page=await context.newPage(); await page.goto(base);await ready(page);
  assert.equal(await page.locator('#character').inputValue(),'assets/dot-chars/hanyangyi-41.png');
  assert.equal(await page.locator('#charOffsetY').inputValue(),'77');
  check('browser process close/relaunch restores draft');
  const upload = path.join(root,'assets','dot-chars','hanyangyi-01.png');
  await page.selectOption('#logoType','custom');
  await page.locator('#logoUpload').setInputFiles(upload);
  await page.selectOption('#imageMode','photo');
  await page.locator('#photoUpload').setInputFiles(upload);
  await page.waitForFunction(() => uploadedLogoImg?.naturalWidth && uploadedPhotoImg?.naturalWidth && !isLogoLoading && !isPhotoLoading);
  await download(page,'#saveDraftBtn','mail-upload-project.json');
  const uploaded=JSON.parse(fs.readFileSync(path.join(results,'mail-upload-project.json'),'utf8'));
  assert(uploaded.uploads.photo.startsWith('data:image/png'));assert(uploaded.uploads.logo.startsWith('data:image/png'));
  await page.waitForFunction(() => document.getElementById('draftStatus').textContent.includes('자동 저장됨'));
  await page.close();page=await context.newPage();await page.goto(base);await ready(page);
  assert(await page.evaluate(() => uploadedLogoImg?.naturalWidth && uploadedPhotoImg?.naturalWidth));
  check('uploaded photo/logo embedded in JSON and restored after close');
  await page.evaluate(async () => {
    const committed = await draftDB('get');
    localStorage.setItem(DRAFT_FAST_KEY, JSON.stringify({ ...committed, updatedAt:Date.now()+1000, uploads:undefined, state:{...committed.state,photoRevision:'replacement-not-yet-committed'} }));
  });
  await page.reload();await ready(page);
  assert.equal(await page.evaluate(()=>uploadedPhotoImg),null);
  assert(await page.evaluate(()=>Boolean(uploadedLogoImg)));
  assert((await page.locator('#draftStatus').textContent()).includes('다시 선택'));
  check('unfinished replacement never restores stale photo bytes');
  const invalid={format:'mail-card-maker',schemaVersion:99,state:{name:'bad'}};
  const before=await page.locator('#name').inputValue();
  await page.locator('#draftFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
  await page.waitForFunction(()=>document.getElementById('draftStatus').textContent.includes('지원하지 않는'));
  assert.equal(await page.locator('#name').inputValue(),before);
  check('unsupported schema rejected without replacing work');
  const legacy={name:'가상이전형식',email:'legacy@example.test',character:'assets/chars/hanyangi_01.png',charScale:'110',charOffsetX:'9999',imageMode:'character',unexpected:'ignored'};
  await page.locator('#draftFile').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await page.waitForFunction(()=>!draftRestoring && elName.value==='가상이전형식');await ready(page);
  assert.equal(await page.locator('#charOffsetX').inputValue(),'250');
  assert.equal(await page.locator('#charScale').inputValue(),'110');
  assert.equal(await page.locator('#charFlip').isChecked(),false);
  check('unwrapped old state defaults new fields and clamps unsafe ranges');
  assert.deepEqual(report.errors,[]);
  fs.writeFileSync(path.join(results,'mail-test-report.json'),JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);report.errors.push(error.stack);fs.writeFileSync(path.join(results,'mail-test-report.json'),JSON.stringify(report,null,2));process.exitCode=1;}).finally(async()=>{await context?.close();server.close();});
