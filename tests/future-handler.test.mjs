import assert from 'node:assert/strict';
import test from 'node:test';

// Tests must never use configured production services or send profiles externally.
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.KV_REST_API_URL;
const { default: handler } = await import('../api/future.js');
const originalFetch = globalThis.fetch;
let providerCalls = 0;
globalThis.fetch = async (url) => {
  assert.equal(url, 'https://api.anthropic.com/v1/messages');
  providerCalls++;
  return { ok: true, json: async () => ({ content: [{type:'text',text:JSON.stringify({move:'Monaco',scene:{lines:['A new morning.','A new routine.','A new chapter.']},confidence:82,fitNote:'Illustrative fit.',why:['Sea','Family','Travel'],alternatives:['UAE','Cyprus'],school:{stay:'Local',move:'International'},climate:{stay:'Temperate',move:'Mediterranean'}})}] }) };
};
test.after(() => { globalThis.fetch = originalFetch; });
const inputs={liquid:'l3',income:'i3',src:'s1',citizen:'zUK',from:'pUK'};
async function run(body,method='POST') {
  const req={method,headers:{},body};
  const res={code:0,body:null,status(n){this.code=n;return this;},json(value){this.body=value;return this;}};
  await handler(req,res);return res;
}
test('complete UK profile returns the full scenario without a runtime error',async()=>{
  const r=await run({profile:'Synthetic UK profile',inputs});
  assert.equal(r.code,200);assert.equal(r.body.move.country,'Monaco');
  assert.equal(r.body.confidence,82);assert.equal(r.body.calc.start,6);
  assert.equal(r.body.taxWarning,'');assert(r.body.calc.stay.taxFirstYear>0);
});
test('French Monaco comparison applies French taxation and its warning',async()=>{
  const r=await run({profile:'Synthetic French profile',inputs:{...inputs,citizen:'zFR',from:'pFR'},compare:'Monaco'});
  assert.equal(r.code,200);assert(r.body.calc.move.taxFirstYear>0);
  assert.match(r.body.taxWarning,/1963/);assert.equal(r.body.calc.stay.end,r.body.calc.move.end);
});
test('US and unknown-country warnings are assembled after inputs are read',async()=>{
  const r=await run({profile:'Synthetic US profile',inputs:{...inputs,citizen:'zUS',from:'pOther'}});
  assert.equal(r.code,200);assert.match(r.body.taxWarning,/US worldwide taxation/);
  assert.match(r.body.taxWarning,/unspecified/);assert.match(r.body.move.tax,/US tax NOT included/);
});
test('missing fields return 400 without contacting a model',async()=>{
  const calls=providerCalls;const r=await run({profile:'Synthetic incomplete profile',inputs:{...inputs,src:null}});
  assert.equal(r.code,400);assert.equal(r.body.error,'incomplete_profile');assert.equal(providerCalls,calls);
});
test('GET is rejected before processing',async()=>{assert.equal((await run({},'GET')).code,405);});
