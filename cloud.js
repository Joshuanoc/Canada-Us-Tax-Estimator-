// The static Pages preview retains local functionality; a Vercel host enables the API.
(async()=>{
 let apiAvailable=false,storageAvailable=false,lastInput=null;
 const notice=document.createElement('p');notice.id='cloudStatus';notice.className='notice info';
 $('savedCalculations').before(notice);
 const request=async(path,{method='GET',body}={})=>{
  const response=await fetch(path,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(()=>({error:'Service unavailable.'}));
  if(!response.ok)throw new Error(data.error||'Request failed.');return data;
 };
 const collect=()=>{
  const input={country:$('country').value,subRegion:$('subRegion').value,mode,filingStatus:$('filingStatus').value,businessType:$('businessType').value,standardDeduction:$('standardDeduction').checked};
  document.querySelectorAll('input[type=number]').forEach(el=>{input[el.id]=Number(el.value||0)});return input;
 };
 const pending=async(button,work)=>{button.disabled=true;try{setError('');await work();}catch(e){setError(e.message);}finally{button.disabled=false;}};
 async function calculateOnServer(){const input=collect();const data=await request('/api/calculate',{method:'POST',body:input});lastInput=input;renderResult(data.result);return data.result;}
 async function listScenarios(){
  const {scenarios}=await request('/api/scenarios');const box=$('savedCalculations');box.replaceChildren();
  if(!scenarios.length){const p=document.createElement('p');p.className='panel-desc';p.textContent='No cloud scenarios saved yet.';box.append(p);return;}
  for(const row of scenarios){
   const item=document.createElement('div');item.className='saved-item';
   const content=document.createElement('div'),name=document.createElement('strong'),summary=document.createElement('span');
   name.textContent=row.name;summary.textContent=`${row.result.country.toUpperCase()} ${row.result.subRegion} · Tax ${money(row.result.estimated)} · ${new Date(row.created_at).toLocaleString()}`;content.append(name,summary);
   const load=document.createElement('button');load.className='btn secondary';load.textContent='Load';load.onclick=()=>pending(load,async()=>{
    $('country').value=row.input.country;populateRegions();switchMode(row.input.mode);
    for(const [key,value]of Object.entries(row.input)){const el=$(key);if(!el)continue;if(el.type==='checkbox')el.checked=value;else el.value=String(value);}
    $('itemizedSection').classList.toggle('hidden',$('standardDeduction').checked);await calculateOnServer();
   });
   const del=document.createElement('button');del.className='btn danger';del.textContent='Delete';del.dataset.del=row.id;del.onclick=()=>pending(del,async()=>{await request(`/api/scenarios?id=${encodeURIComponent(row.id)}`,{method:'DELETE'});await listScenarios();});
   item.append(content,load,del);box.append(item);
  }
 }
 try{const health=await request('/api/health');apiAvailable=health.status==='ok';storageAvailable=health.storageConfigured===true;}catch{}
 if(!apiAvailable){notice.textContent='This preview saves scenarios only in this browser. Cloud saving is available on the backend deployment.';return;}
 $('calculateBtn').onclick=()=>pending($('calculateBtn'),calculateOnServer);
 $('saveScenarioBtn').onclick=()=>pending($('saveScenarioBtn'),async()=>{scenarioA=await calculateOnServer();$('saveScenarioBtn').textContent='✓ Scenario A saved';});
 if(!storageAvailable){notice.textContent='Cloud saving is not connected yet. Calculations run on the server; saves remain in this browser.';return;}
 notice.textContent='Saved scenarios are private to this browser. Clearing its cookies removes access; no login is needed.';
 $('saveBtn').onclick=()=>pending($('saveBtn'),async()=>{
  if(!lastInput)throw new Error('Calculate a scenario before saving it.');
  await request('/api/scenarios',{method:'POST',body:{name:`${lastInput.country.toUpperCase()} ${lastInput.subRegion} ${lastInput.mode}`,input:lastInput}});await listScenarios();
 });
 $('clearSavedBtn').textContent='Manage saved scenarios';$('clearSavedBtn').onclick=()=>pending($('clearSavedBtn'),listScenarios);
 try{await listScenarios();}catch(e){setError(e.message);}
})();
