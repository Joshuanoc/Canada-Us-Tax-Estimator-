/** Screening is separate from calculations; unverified answers never authorize claims. */
export const statuses=Object.freeze({eligible:'Eligible',potentially_eligible:'Potentially eligible',ineligible:'Ineligible',insufficient_information:'Insufficient information'});
export function questionsFor(entry){return entry.screeningQuestions|| (entry.eligibilityConditions||[]).map((prompt,index)=>({id:`condition-${index}`,prompt,necessary:false}));}
export function screenOpportunity(entry, answers={}, context={}) {
 if(!entry||typeof entry.id!=='string')throw new TypeError('A catalog entry is required.');
 const questions=questionsFor(entry);
 if(context.taxYear!==2026||!['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].includes(context.province))return {status:'insufficient_information',reason:'Select a supported province and tax year before interpreting eligibility.'};
 const failed=questions.find(question=>question.necessary===true&&answers[question.id]==='no');
 if(failed)return {status:'ineligible',reason:`A required condition is not met: ${failed.prompt}`};
 if(!questions.length||questions.some(q=>!['yes','no'].includes(answers[q.id])))return {status:'insufficient_information',reason:'Select your province and tax year, then answer each condition. Unanswered or uncertain conditions need further information.'};
 if(questions.some(q=>answers[q.id]==='no'))return {status:'insufficient_information',reason:'Some conditions do not match. Review alternative conditions with the official guidance before deciding eligibility.'};
 return {status:'potentially_eligible',reason:'Your answers suggest this may apply. Confirm current-year rules, limits and supporting documents before claiming it.'};
}
export function filteredEntries(entries,{search='',group=''}={}){const q=search.trim().toLocaleLowerCase('en-CA');const exact=entries.filter(entry=>entry.name.toLocaleLowerCase('en-CA')===q);const candidates=exact.length?exact:entries;return candidates.filter(entry=>(!group||entry.group===group)&&(!q||`${entry.name} ${(entry.requiredInformation||[]).join(' ')}`.toLocaleLowerCase('en-CA').includes(q)));}
