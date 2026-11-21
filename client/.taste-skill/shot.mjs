import { Browser } from '/Users/nads/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch({ width: 1440, height: 900 });
const session = { username: 'nads', accessToken: 'x', conversations: [
 { id: 'a', messages: [{role:'user',content:'How do I reverse a list in Python?'},{role:'assistant',content:'Use `my_list[::-1]` for a copy, or `my_list.reverse()` to reverse in place.\n\n```python\nxs = [1, 2, 3]\nxs.reverse()\n```'}]},
 { id: 'b', messages: [{role:'user',content:'Draft a short email declining a meeting'},{role:'assistant',content:'Hi Sam, thanks for the invite. I cannot make it this week, but happy to catch up next.'}]} ]};
for (const [scheme, w, h] of [['light',1440,900],['dark',1440,900],['light',390,844]]) {
  const p = await b.newPage({ width: w, height: h });
  await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  await p.goto('http://localhost:3000/login');
  await p.eval(`localStorage.setItem('chatbot.session', ${JSON.stringify(JSON.stringify(session))})`);
  await p.goto('http://localhost:3000/', { settleMs: 2500 });
  await p.screenshot({ path: `.taste-skill/chat-${scheme}-${w}-empty.jpg` });
  await p.eval(`document.querySelectorAll('nav [role=button], nav button').forEach(e=>{ if(e.textContent.includes('reverse')) e.click() })`);
  await new Promise(r=>setTimeout(r,800));
  await p.screenshot({ path: `.taste-skill/chat-${scheme}-${w}-open.jpg` });
  await p.close();
}
await b.close();
