import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const html=readFileSync('index.html','utf8');
const data=JSON.parse(html.match(/<script id="game-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.equal(data.stages.length,8);
assert.deepEqual(data.questions.map(q=>q.id),Array.from({length:25},(_,i)=>i+1));
assert.deepEqual(data.stages.flatMap(s=>s.quiz),data.questions.map(q=>q.id));
assert.equal(data.questions[10].type,'single');
assert(!data.questions[10].techniques);
const js=html.split('<script type="module">')[1].split('</script>')[0];
const check=spawnSync(process.execPath,['--check','--input-type=module'],{input:js,encoding:'utf8'});
assert.equal(check.status,0,check.stderr);
console.log('Passed: 8 stages, 25 questions, game script syntax.');

