import {screenOpportunity,statuses,filteredEntries,questionsFor} from './eligibility.js';
const $=id=>document.getElementById(id),panel=$('taxOpportunityPanel');
const groups={employment:'Employment & education',family:'Family & dependants',home_retirement:'Home & retirement',health_benefits:'Health, benefits & regional',investment_business:'Investments & business'};
const answers=new Map();let entries=[],index=0;const context=()=>({taxYear:Number($('eligibilityTaxYear').value),province:$('subRegion').value});
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
function bullets(title,items,container){if(!items?.length)return;container.append(node('h4',title));const ul=node('ul');items.forEach(text=>ul.append(node('li',text)));container.append(ul);}
function render(){
 panel.hidden=$('country').value!=='ca';if(panel.hidden)return;
 const matches=filteredEntries(entries,{search:$('taxOpportunitySearch').value,group:$('taxOpportunityGroup').value});
 index=Math.max(0,Math.min(index,matches.length-1));const entry=matches[index],list=$('taxOpportunityList');list.replaceChildren();
 $('taxOpportunityCount').textContent=`${answers.size} of ${entries.length} reviewed · ${matches.length} opportunities in this view`;
 $('opportunityPrevious').disabled=index===0;$('opportunityNext').disabled=!entry||index===matches.length-1;
 $('opportunityPage').textContent=entry?`Opportunity ${index+1} of ${matches.length}`:'No matches';
 if(!entry){list.append(node('p','No matches. Clear the search or select another category.'));return;}
 const card=node('article',undefined,'opportunity-card');card.dataset.opportunity=entry.id;
 card.append(node('span',groups[entry.group],'opportunity-meta'),node('h3',entry.name));
 const application=entry.calculationSupport?.implemented?(entry.id==='canada-employment-amount'?'Included in the supported employment estimate':'Available with confirmed deduction input'):'Information only — not added to your calculation';
 card.append(node('p',`${(entry.classification||'Review pending').replaceAll('_',' ')} · ${application}`,'opportunity-meta'));
 const result=screenOpportunity(entry,answers.get(entry.id),context());const status=node('p',statuses[result.status],'opportunity-state');status.setAttribute('role','status');card.append(status,node('p',result.reason));
 bullets('Review the conditions',entry.eligibilityConditions,card);
 for(const question of questionsFor(entry)){
 const fieldset=node('fieldset'),legend=node('legend',question.prompt);fieldset.append(legend);
 if(question.necessary)fieldset.append(node('p','This is a required condition.','opportunity-meta'));
 for(const [value,label]of [['yes','Yes'],['no','No'],['unknown','Not sure']]){
  const lab=node('label'),radio=node('input');radio.type='radio';radio.name=question.id;radio.value=value;radio.checked=answers.get(entry.id)?.[question.id]===value;
  radio.addEventListener('change',()=>{answers.set(entry.id,{...answers.get(entry.id),[question.id]:value});render();list.querySelector(`input[name="${question.id}"][value="${value}"]`)?.focus();});lab.append(radio,document.createTextNode(label));fieldset.append(lab);
 }
 card.append(fieldset);
 }

 const details=node('details');details.append(node('summary','Documents, limits and official guidance'));
 bullets('Information to gather',entry.requiredInformation,details);bullets('Limits and tax-year notes',entry.limits,details);
 if(entry.provincialDifferences)details.append(node('h4','Provincial differences'),node('p',entry.provincialDifferences));
 if(entry.review)details.append(node('p',`Review scope: ${(entry.review.scope||'pending').replaceAll('_',' ')}. Tax-year status: ${(entry.review.taxYearStatus||'unverified').replaceAll('_',' ')}.`,'opportunity-meta'));
 for(const source of entry.sources||[]){try{const url=new URL(source.url);if(url.protocol!=='https:'||url.hostname!=='www.canada.ca')continue;const a=node('a',source.title);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';details.append(a,node('br'));}catch{}}
 card.append(details);list.append(card);
 const summary=$('eligibilitySummary');summary.replaceChildren();
 if(answers.size){summary.append(node('h3','Your review summary'));for(const reviewed of entries.filter(e=>answers.has(e.id))){const row=node('p',`${reviewed.name}: ${statuses[screenOpportunity(reviewed,answers.get(reviewed.id),context()).status]}`);summary.append(row);}}
}
for(const id of ['country','subRegion','eligibilityTaxYear'])$(id).addEventListener('change',render);
for(const id of ['taxOpportunitySearch','taxOpportunityGroup'])$(id).addEventListener('input',()=>{index=0;render();});
$('opportunityPrevious').addEventListener('click',()=>{index--;render();$('taxOpportunityList').querySelector('h3')?.scrollIntoView({block:'nearest'});});
$('opportunityNext').addEventListener('click',()=>{index++;render();$('taxOpportunityList').querySelector('h3')?.scrollIntoView({block:'nearest'});});
$('eligibilityReset').addEventListener('click',()=>{answers.clear();index=0;render();});
try{const response=await fetch('./data/ca-2026-opportunities.json');if(!response.ok)throw new Error('Catalog unavailable');const data=await response.json();entries=data.entries;render();}catch{$('taxOpportunityCount').textContent='The opportunity guide could not load. Your tax calculator is still available. Reload to try again.';}
