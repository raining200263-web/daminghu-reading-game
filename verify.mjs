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
// Check the real completion handler: neither the bell nor a partial slider may advance.
const reflectionCode=js.slice(js.indexOf('function seeReflection('),js.indexOf('\nfunction seeReeds('));
const simulate=new Function('value','confirm','ready','pitch',`
 let lakeReady=ready,yaw=0,lakeSunset=false,marked=0,lighting=0,narration=0;
 const reflectionReveal={value};
 const toast=()=>{},updateActivity=()=>{},markFound=()=>marked++;
 const sunsetLighting=()=>lighting++,sceneNarration=()=>narration++;
 ${reflectionCode}
 seeReflection(confirm);return {lakeSunset,marked,lighting,narration};`);
for(const value of [0,.5,.95,.99,1])assert.equal(simulate(value,false,true,-.2).lakeSunset,false);
for(const value of [0,.5,.95,.99])assert.equal(simulate(value,true,true,-.2).marked,0);
assert.equal(simulate(1,true,false,-.2).marked,0);
assert.equal(simulate(1,true,true,0).marked,0);
assert.deepEqual(simulate(1,true,true,-.2),{lakeSunset:true,marked:1,lighting:1,narration:1});
assert(js.includes('seeReflection(true);updateActivity();'));
console.log('Passed: reflection requires 100% reveal and explicit completion.');

