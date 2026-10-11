// 2026 partial rule table. See docs/calculation-model.md for verification scope.
export function saltDeduction2026(paid, modifiedAgi, status) {
  const separate = status === 'married_separate';
  // Schedule A worksheet halves the applicable limit after its MAGI reduction.
  const threshold = separate ? 252500 : 505000;
  const fullLimit = Math.max(10000, 40400 - .30 * Math.max(modifiedAgi - threshold, 0));
  return Math.min(paid, separate ? fullLimit / 2 : fullLimit);
}
export const usBrackets={
  single:[[12400,.10],[50400,.12],[105700,.22],[201775,.24],[256225,.32],[640600,.35],[Infinity,.37]],married_joint:[[24800,.10],[100800,.12],[211400,.22],[403550,.24],[512450,.32],[768700,.35],[Infinity,.37]],married_separate:[[12400,.10],[50400,.12],[105700,.22],[201775,.24],[256225,.32],[384350,.35],[Infinity,.37]],head:[[17700,.10],[67450,.12],[105700,.22],[201750,.24],[256200,.32],[640600,.35],[Infinity,.37]]
};

export const usStd={
  single:16100,married_joint:32200,married_separate:16100,head:24150
};

export const caFederal=[[58523,.14],[117045,.205],[181440,.26],[258482,.29],[Infinity,.33]];

export const caProv={
  AB:[[61200,.08],[154259,.10],[185111,.12],[246813,.13],[370220,.14],[Infinity,.15]],BC:[[50363,.056],[100728,.077],[115648,.105],[140430,.1229],[190405,.147],[265545,.168],[Infinity,.205]],MB:[[47564,.108],[101200,.1275],[Infinity,.174]],NB:[[52333,.094],[104666,.14],[193861,.16],[Infinity,.195]],NL:[[44678,.087],[89354,.145],[159528,.158],[223340,.178],[285319,.198],[570638,.208],[1141275,.213],[Infinity,.218]],NS:[[30995,.0879],[61991,.1495],[97417,.1667],[157124,.175],[Infinity,.21]],NT:[[53003,.059],[106009,.086],[172346,.122],[Infinity,.1405]],NU:[[55801,.04],[111602,.07],[181439,.09],[Infinity,.115]],ON:[[53891,.0505],[107785,.0915],[150000,.1116],[220000,.1216],[Infinity,.1316]],PE:[[33928,.095],[65820,.1347],[106890,.166],[142520,.1762],[200000,.19],[Infinity,.20]],SK:[[54532,.105],[155805,.125],[Infinity,.145]],YT:[[58523,.064],[117045,.09],[181440,.109],[500000,.128],[Infinity,.15]]
};

export const provBPA={
  AB:22769,BC:13216,NB:13664,NL:15000,NS:11932,NT:18198,NU:19659,ON:12989,PE:15000,SK:20381
};

export const usRegions=['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],caRegions=Object.keys(caProv);


