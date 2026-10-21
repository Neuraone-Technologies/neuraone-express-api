import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
async function fixture(t) {
 const server = createApp({ logger: () => {} }).listen(0, '127.0.0.1');
 await once(server, 'listening');
 t.after(() => new Promise(resolve => server.close(resolve)));
 return (path, options) => fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}
test('root and health return JSON with a request ID', async t => {
 const request = await fixture(t);
 for (const path of ['/', '/health']) { const r = await request(path); assert.equal(r.status, 200); assert.ok(r.headers.get('x-request-id')); assert.ok(await r.json()); }
});
test('create, retrieve, filter and paginate projects', async t => {
 const request = await fixture(t);
 const r = await request('/projects', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({title:'Demo API',tech:'Node'}) });
 assert.equal(r.status,201); const {data} = await r.json();
 assert.equal(r.headers.get('location'), `/projects/${data.id}`);
 assert.deepEqual((await (await request(`/projects/${data.id}`)).json()).data, data);
 const list = await (await request('/projects?tech=node&limit=1')).json(); assert.equal(list.total,1); assert.equal(list.data[0].tech,'node');
 assert.equal((await (await request('/projects?offset=1')).json()).data.length,0);
 assert.equal((await (await request('/projects?tech=python')).json()).total,0);
});
test('invalid bodies, malformed JSON, oversized input, queries and missing routes are rejected', async t => {
 const request = await fixture(t);
 for (const body of ['{}','null','[]','{"title":4,"tech":"node"}','{']) {
  const r = await request('/projects',{method:'POST',headers:{'Content-Type':'application/json'},body}); assert.equal(r.status,400); assert.ok((await r.json()).error.message);
 }
 assert.equal((await request('/projects',{method:'POST',headers:{'Content-Type':'text/plain'},body:'hello'})).status,415);
 assert.equal((await request('/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'x'.repeat(20000),tech:'node'})})).status,413);
 for (const q of ['limit=0','limit=1.5','offset=-1','tech=a&tech=b']) assert.equal((await request(`/projects?${q}`)).status,400);
 for (const p of ['/projects/missing','/unknown']) assert.equal((await request(p)).status,404);
});
test('configuration is validated at startup', () => {
 assert.deepEqual(readConfig({}),{port:3000,host:'127.0.0.1'});
 for (const PORT of ['bad','0','65536','1.5']) assert.throws(() => readConfig({PORT}));
 assert.throws(() => readConfig({HOST:''}));
});
