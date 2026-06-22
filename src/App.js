import { useState, useMemo } from "react";
import BizDevLogo from "./logo-biz-dev.png";
import JSZip from "jszip";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import attestationData from "./data.json";
import profilesData from "./profiles.json";
import aosRaw from "./AOs.json";
import awardsRaw from "./awards.json";
const { ATTS_PR, ATTS_D1 } = attestationData;
const AOS = Array.isArray(aosRaw) ? aosRaw : (aosRaw.results || []);


const THEMES = {
  PR: { key:"PR", name:"PR Media", sub:"Burson affiliate", accent:"#E8392A", navy:"#1C2B4B" },
  D1: { key:"D1", name:"D1 Social", sub:"360° Communications", accent:"#F7BE00", navy:"#1C2B4B" },
};
const W="#FFFFFF", BG="#F7F6F3", BD="#E0DDD7", MU="#9A9590", LT="#EDEAE4";

const fmt     = (m,d) => !m?"—":(m>=1e6?(m/1e6).toFixed(1)+"M":Math.round(m/1000)+"K")+" DH "+d;
const fmtFull = (m,d) => !m?"Non précisé":new Intl.NumberFormat("fr-MA").format(Math.round(m))+" DH "+d;
const driveUrl = fid  => `https://drive.google.com/file/d/${fid}/view`;

function groupBy(list) {
  const map={};
  list.forEach(a=>{if(!map[a.ann])map[a.ann]={ann:a.ann,sec:a.sec,items:[]};map[a.ann].items.push(a);});
  return Object.values(map).sort((a,b)=>b.items.reduce((s,x)=>s+(x.m||0),0)-a.items.reduce((s,x)=>s+(x.m||0),0));
}

const IcLink  = ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>;
const IcGrid  = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcFind  = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcSrch  = ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9590" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcBurger= ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcClose = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcFilter= ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcUsers = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IcDl    = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcDoc   = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const IcTrophy= ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>;





const CTip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:"#1C2B4B",color:"#fff",padding:"8px 13px",borderRadius:6,fontSize:12}}><div style={{color:"rgba(255,255,255,.6)",marginBottom:2,fontSize:11}}>{label}</div><div style={{fontWeight:700}}>{payload[0].value}M DH</div></div>;
};

// ─── AO HELPERS ──────────────────────────────────────────────────────────────
const AO_ACCENT = "#1C5B7A";
const AO_MODE_COLOR = { AOO:"#E8392A", AOS:"#6B7FA3", AMI:"#C4A882" };

function cleanIntitule(s) {
  if (!s) return "";
  const i = s.indexOf(" ... ");
  return (i > 0 ? s.slice(0, i) : s).trim();
}
function parseDeadline(s) {
  if (!s) return null;
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  return m ? new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5]) : null;
}
function parseMAD(s) {
  if (!s || typeof s !== "string") return null;
  const n = parseFloat(s.replace(/MAD/g,"").replace(/\s/g,"").replace(",","."));
  return isNaN(n) || n === 0 ? null : n;
}
const parseEstimation = parseMAD;
const parseCaution    = parseMAD;
function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((d - new Date()) / 864e5);
}
function fmtMAD(n) {
  if (!n) return null;
  return n >= 1e6 ? (n/1e6).toFixed(2)+"M DH" : Math.round(n/1000)+"K DH";
}
function cleanMode(s) {
  return s ? s.replace(/^\|\s*/,"").trim() : "";
}

// ─── AWARDS HELPERS ───────────────────────────────────────────────────────────
function parseAwardDeadline(s) {
  if (!s) return null;
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})(\d{2}):(\d{2})/);
  return m ? new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5]) : null;
}
function parseAwardMontant(s) {
  if (!s || s === "-") return null;
  const n = parseFloat(s.replace(/\s/g,"").replace(",","."));
  return isNaN(n) || n === 0 ? null : n;
}
const AWARD_ACCENT  = "#16A34A";
const AWARDS        = awardsRaw.filter(x => x.award_source);
const AWARDS_PV     = AWARDS.filter(x => x.award_source === "EXTRAIT_PV");
const AWARDS_SUIVI  = AWARDS.filter(x => x.award_source === "SUIVI_COMMISSION");
const TOTAL_AWARDED = AWARDS_PV.reduce((s,x) => s + (parseAwardMontant(x.award_winner?.montant) || 0), 0);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ atts: allAtts, theme }) {
  const [selAgency, setSelAgency] = useState("Tous");
  const atts = selAgency==="Tous" ? allAtts : allAtts.filter(a=>a._ag===selAgency);
  const A=theme.accent;
  const total=atts.filter(a=>a.m).reduce((s,a)=>s+a.m,0);
  const anns=[...new Set(atts.map(a=>a.ann))];
  const maxM=[...atts].filter(a=>a.m).sort((a,b)=>b.m-a.m)[0]?.m||1;

  const barData=groupBy(atts).slice(0,8).map(g=>({
    name:g.ann.length>13?g.ann.slice(0,12)+"…":g.ann,
    val:parseFloat((g.items.reduce((s,a)=>s+(a.m||0),0)/1e6).toFixed(2)),
  })).filter(d=>d.val>0);

  const typeCount={};
  atts.forEach(a=>(Array.isArray(a.type)?a.type:[]).forEach(t=>{typeCount[t]=(typeCount[t]||0)+1;}));
  const COLORS=[A,"#1C2B4B","#C4A882","#6B7FA3","#A0522D","#4A6741","#8B6914","#2E5C8A"];
  const pieData=Object.entries(typeCount).sort((a,b)=>b[1]-a[1]).map(([name,value],i)=>({name,value,color:COLORS[i%COLORS.length]}));

  const yearCount={};
  atts.forEach(a=>{yearCount[a.yr]=(yearCount[a.yr]||0)+1;});
  const timeData=Object.entries(yearCount).sort((a,b)=>+a[0]-+b[0]).map(([year,nb])=>({year,nb}));

  const secCount={};
  atts.forEach(a=>{secCount[a.sec]=(secCount[a.sec]||0)+1;});
  const radarData=Object.entries(secCount).map(([sec,val])=>({sec:sec.length>10?sec.slice(0,9)+"…":sec,val}));

  const kpis=[
    ["Attestations",atts.length,"dossiers Drive"],
    ["Annonceurs",anns.length,"clients"],
    ["Volume","+"+(Math.round(total/1e6)||"<1")+"M DH","prestations"],
    ["Récent",Math.max(...atts.map(a=>a.yr)),""],
  ];

  return (
    <div style={{animation:"fi .4s ease"}}>
      {/* Agency filter */}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:16}}>
        {["Tous","PR Media","D1 Social"].map(ag=>(
          <button key={ag} onClick={()=>setSelAgency(ag)} style={{
            padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",
            border:`1.5px solid ${selAgency===ag?A:BD}`,
            background:selAgency===ag?`${A}20`:W,
            color:selAgency===ag?(theme.key==="D1"?"#1C2B4B":A):MU,
            transition:"all .12s",
          }}>{ag}</button>
        ))}
      </div>
      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map(([label,val,sub],i)=>(
          <div key={i} style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",borderLeft:`4px solid ${A}`}}>
            <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>{label}</div>
            <div style={{fontSize:22,fontWeight:800,color:"#1C2B4B",fontFamily:"Georgia,serif",lineHeight:1}}>{val}</div>
            {sub&&<div style={{fontSize:10,color:MU,marginTop:4}}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Graphes — tous en colonne sur mobile, 2 colonnes sur desktop */}
      <div className="chart-col">

        {/* Bar + Pie côte à côte sur desktop */}
        <div className="chart-row-1">
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"18px 16px"}}>
          <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:14}}>Volume par annonceur (M DH)</div>
          {barData.length===0
            ? <div style={{color:MU,fontSize:12,textAlign:"center",padding:30}}>Données insuffisantes</div>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{top:0,right:4,left:-18,bottom:0}} barCategoryGap="28%">
                  <XAxis dataKey="name" tick={{fontSize:9,fill:MU}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:MU}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CTip/>} cursor={{fill:`${A}08`}}/>
                  <Bar dataKey="val" radius={[4,4,0,0]}>
                    {barData.map((_,i)=><Cell key={i} fill={i===0?A:i===1?"#1C2B4B":"#C4A882"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Pie + légende */}
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"18px 16px"}}>
          <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:12}}>Types de prestation</div>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value" paddingAngle={2}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={(v,n)=>[`${v} réf.`,n]} contentStyle={{fontSize:11,borderRadius:6,border:`1px solid ${BD}`}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:6,minWidth:120}}>
              {pieData.slice(0,6).map((d,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                  <div style={{fontSize:11,color:"#1C2B4B",flex:1}}>{d.name}</div>
                  <div style={{fontSize:11,color:MU,fontWeight:600}}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>{/* end chart-row-1 */}

        {/* Timeline + Radar */}
        <div className="chart-pair">
          <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"18px 16px"}}>
            <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:14}}>Attestations par année</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={timeData} margin={{top:0,right:4,left:-22,bottom:0}} barCategoryGap="40%">
                <XAxis dataKey="year" tick={{fontSize:10,fill:MU}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:MU}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={{fontSize:11,borderRadius:6,border:`1px solid ${BD}`}} formatter={v=>[v+" réf.",""]}/>
                <Bar dataKey="nb" fill="#1C2B4B" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"18px 16px"}}>
            <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Couverture sectorielle</div>
            <ResponsiveContainer width="100%" height={170}>
              <RadarChart data={radarData} margin={{top:10,right:16,left:16,bottom:10}}>
                <PolarGrid stroke={BD}/>
                <PolarAngleAxis dataKey="sec" tick={{fontSize:9,fill:MU}}/>
                <Radar dataKey="val" stroke={A} fill={A} fillOpacity={0.2} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 */}
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"18px 16px"}}>
          <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:14}}>Top 5 par montant</div>
          {[...atts].filter(a=>a.m).sort((a,b)=>b.m-a.m).slice(0,5).map((a,i)=>(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:i===0?A:"#1C2B4B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:i===0&&theme.key==="D1"?"#1C2B4B":W,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:6,marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#1C2B4B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"55%"}}>{a.ann}</span>
                  <span style={{fontSize:11,fontWeight:700,color:A,flexShrink:0}}>{fmt(a.m,a.dv)}</span>
                </div>
                <div style={{height:5,background:LT,borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${(a.m/maxM)*100}%`,height:"100%",background:i===0?A:"#1C2B4B",borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:MU,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.lbl}</div>
              </div>
              <a href={driveUrl(a.fid)} target="_blank" rel="noopener noreferrer"
                style={{flexShrink:0,width:32,height:32,borderRadius:6,background:LT,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"#1C2B4B"}}
                onMouseOver={e=>e.currentTarget.style.background=`${A}25`}
                onMouseOut={e=>e.currentTarget.style.background=LT}>
                <IcLink/>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RECHERCHE ────────────────────────────────────────────────────────────────
function Search({ atts: allAtts, theme }) {
  const [selAgency, setSelAgency] = useState("Tous");
  const atts = selAgency==="Tous" ? allAtts : allAtts.filter(a=>a._ag===selAgency);
  const A=theme.accent;
  const [query,    setQuery]    = useState("");
  const [selTypes, setSelTypes] = useState([]);
  const [selSecs,  setSelSecs]  = useState([]);
  const [minM,     setMinM]     = useState("");
  const [minY,     setMinY]     = useState("");
  const [selIds,   setSelIds]   = useState([]);
  const [showRes,  setShowRes]  = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortAnn,  setSortAnn]  = useState("alpha");

  const ALL_TYPES=useMemo(()=>[...new Set(atts.flatMap(a=>a.type))].sort(),[atts]);
  const ALL_SECS =useMemo(()=>[...new Set(atts.map(a=>a.sec))].sort(),[atts]);

  const filtered=useMemo(()=>atts.filter(a=>{
    if(query){const q=query.toLowerCase();const t=(Array.isArray(a.type)?a.type:[]).join(" ");if(!a.ann.toLowerCase().includes(q)&&!a.lbl.toLowerCase().includes(q)&&!a.sec.toLowerCase().includes(q)&&!t.toLowerCase().includes(q))return false;}
    if(selTypes.length&&!(Array.isArray(a.type)?a.type:[]).some(t=>selTypes.includes(t)))return false;
    if(selSecs.length&&!selSecs.includes(a.sec))return false;
    if(minM&&a.m<parseFloat(minM))return false;
    if(minY&&a.yr<parseInt(minY))return false;
    return true;
  }),[atts,query,selTypes,selSecs,minM,minY]);

  const groups   = useMemo(()=>{
    const g = groupBy(filtered);
    if (sortAnn==="alpha") g.sort((a,b)=>a.ann.localeCompare(b.ann,"fr"));
    return g;
  },[filtered,sortAnn]);
  const toggle   = (id,v)=>setSelIds(p=>v?(p.includes(id)?p:[...p,id]):p.filter(x=>x!==id));
  const togType  = t=>setSelTypes(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);
  const togSec   = s=>setSelSecs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const hasFilter= query||selAgency!=="Tous"||selTypes.length||selSecs.length||minM||minY;
  const reset    = ()=>{setQuery("");setSelAgency("Tous");setSelTypes([]);setSelSecs([]);setMinM("");setMinY("");};
  const selAtts  = atts.filter(a=>selIds.includes(a.id));
  const inp      = {width:"100%",background:BG,border:`1.5px solid ${BD}`,borderRadius:6,color:"#1C2B4B",fontFamily:"inherit",fontSize:13,padding:"9px 11px",outline:"none"};

  const FilterContent = ()=>(
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:16}}>
      <div>
        <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Agence</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {["Tous","PR Media","D1 Social"].map(ag=>(
            <button key={ag} onClick={()=>setSelAgency(ag)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${selAgency===ag?A:BD}`,background:selAgency===ag?`${A}20`:W,color:selAgency===ag?(theme.key==="D1"?"#1C2B4B":A):MU,transition:"all .12s"}}>{ag}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Type de prestation</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {ALL_TYPES.map(t=>(
            <button key={t} onClick={()=>togType(t)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${selTypes.includes(t)?A:BD}`,background:selTypes.includes(t)?`${A}20`:W,color:selTypes.includes(t)?theme.key==="D1"?"#1C2B4B":A:MU,transition:"all .12s"}}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Secteur</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {ALL_SECS.map(s=>(
            <button key={s} onClick={()=>togSec(s)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${selSecs.includes(s)?A:BD}`,background:selSecs.includes(s)?`${A}20`:W,color:selSecs.includes(s)?theme.key==="D1"?"#1C2B4B":A:MU,transition:"all .12s"}}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Montant min (DH)</div>
          <input type="number" placeholder="1 000 000" value={minM} onChange={e=>setMinM(e.target.value)} style={inp}/>
        </div>
        <div>
          <div style={{fontSize:10,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Année min</div>
          <input type="number" placeholder="2022" value={minY} onChange={e=>setMinY(e.target.value)} style={inp}/>
        </div>
      </div>
      <div style={{borderTop:`1px solid ${BD}`,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
        <button onClick={()=>{setSelIds(filtered.map(a=>a.id));setShowFilters(false);}} style={{background:`${A}20`,border:`1.5px solid ${A}40`,borderRadius:6,color:theme.key==="D1"?"#1C2B4B":A,padding:"9px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
          ✓ Tout sélectionner ({filtered.length})
        </button>
        {selIds.length>0&&<button onClick={()=>setSelIds([])} style={{background:LT,border:`1.5px solid ${BD}`,borderRadius:6,color:MU,padding:"9px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>✕ Désélectionner tout</button>}
      </div>
    </div>
  );

  return (
    <div style={{animation:"fi .4s ease"}}>
      {/* Barre de recherche + bouton filtres */}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <div style={{position:"relative",flex:1}}>
          <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><IcSrch/></div>
          <input type="text" placeholder="Rechercher annonceur, prestation…" value={query} onChange={e=>setQuery(e.target.value)}
            style={{width:"100%",background:W,border:`1.5px solid ${query?A:BD}`,borderRadius:8,color:"#1C2B4B",fontFamily:"inherit",fontSize:13,padding:"11px 38px 11px 40px",outline:"none",transition:"all .15s"}}/>
          {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:MU,cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>}
        </div>
        <button onClick={()=>setShowFilters(true)} style={{
          background:hasFilter?A:W,color:hasFilter?(theme.key==="D1"?"#1C2B4B":"#fff"):MU,
          border:`1.5px solid ${hasFilter?A:BD}`,borderRadius:8,padding:"0 14px",
          cursor:"pointer",display:"flex",alignItems:"center",gap:6,
          fontSize:12,fontWeight:600,fontFamily:"inherit",flexShrink:0,
        }}>
          <IcFilter/> Filtres{hasFilter?` (actifs)`:""}
        </button>
      </div>

      {/* Barre résultats + bouton Drive */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#1C2B4B"}}>{groups.length} annonceur{groups.length>1?"s":""}</span>
          <span style={{fontSize:12,color:MU}}>· {filtered.length} attestation{filtered.length>1?"s":""}</span>
          {hasFilter&&<span style={{background:`${A}20`,color:theme.key==="D1"?"#1C2B4B":A,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>Filtré</span>}
          <div style={{display:"flex",background:LT,borderRadius:6,padding:2,gap:1,marginLeft:4}}>
            {[["alpha","A→Z"],["volume","Volume"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSortAnn(v)} style={{padding:"3px 9px",borderRadius:4,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,background:sortAnn===v?W:"transparent",color:sortAnn===v?"#1C2B4B":MU,boxShadow:sortAnn===v?"0 1px 3px rgba(0,0,0,.1)":"none",transition:"all .15s"}}>{l}</button>
            ))}
          </div>
        </div>
        {selIds.length>0&&(
          <button onClick={()=>setShowRes(true)} style={{background:A,color:theme.key==="D1"?"#1C2B4B":"#fff",border:"none",borderRadius:7,padding:"9px 16px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",boxShadow:`0 3px 12px ${A}40`}}>
            <IcLink/> {selIds.length} lien{selIds.length>1?"s":""} Drive
          </button>
        )}
      </div>

      {/* Desktop: sidebar + contenu / Mobile: juste contenu */}
      <div className="search-layout">
        {/* Sidebar desktop */}
        <div className="sidebar-desktop" style={{background:W,border:`1px solid ${BD}`,borderRadius:10,overflow:"hidden",position:"sticky",top:72}}>
          <div style={{background:"#1C2B4B",padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:700,color:W}}>Critères AO</span>
            {hasFilter&&<button onClick={reset} style={{background:"none",border:"none",color:"rgba(255,255,255,.65)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Réinitialiser</button>}
          </div>
          <FilterContent/>
        </div>

        {/* Liste annonceurs */}
        <div className="search-results">
          {groups.length===0?(
            <div style={{textAlign:"center",padding:50,color:MU,background:W,borderRadius:10,border:`1px solid ${BD}`}}>Aucune attestation ne correspond.</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {groups.map(g=>{
                const allSel=g.items.every(a=>selIds.includes(a.id));
                const someSel=g.items.some(a=>selIds.includes(a.id));
                const tgAll=()=>allSel?g.items.forEach(a=>toggle(a.id,false)):g.items.forEach(a=>toggle(a.id,true));
                return (
                  <div key={g.ann} style={{background:W,border:`1.5px solid ${someSel?A:BD}`,borderRadius:10,overflow:"hidden",boxShadow:someSel?`0 0 0 3px ${A}18`:"0 1px 4px rgba(0,0,0,.04)",transition:"all .15s"}}>
                    <div style={{background:someSel?`${A}10`:LT,borderBottom:`1px solid ${someSel?A+"28":BD}`,padding:"11px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,minWidth:0,overflow:"hidden"}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#1C2B4B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.ann}</div>
                        <div style={{fontSize:10,color:MU,marginTop:1}}>{g.sec} · {g.items.length} att.</div>
                      </div>
                      <button onClick={tgAll} style={{background:allSel?A:W,color:allSel?(theme.key==="D1"?"#1C2B4B":"#fff"):MU,border:`1.5px solid ${allSel?A:BD}`,borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .12s",flexShrink:0}}>
                        {allSel?"✓ Désel.":"Sél. tout"}
                      </button>
                    </div>
                    {g.items.map((a,i)=>{
                      const sel=selIds.includes(a.id);
                      return (
                        <div key={a.id} onClick={()=>toggle(a.id,!sel)} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 12px",cursor:"pointer",background:sel?`${A}06`:W,borderBottom:i<g.items.length-1?`1px solid ${BD}`:"none",transition:"background .12s",minWidth:0,overflow:"hidden"}}>
                          <div style={{width:18,height:18,borderRadius:4,flexShrink:0,border:`2px solid ${sel?A:BD}`,background:sel?A:W,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s"}}>
                            {sel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.key==="D1"?"#1C2B4B":"white"} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
                            <div style={{fontSize:12,fontWeight:500,color:"#1C2B4B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.lbl}</div>
                            <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>{(Array.isArray(a.type)?a.type:[]).slice(0,2).map(t=><span key={t} style={{fontSize:9,background:LT,color:"#1C2B4B",borderRadius:3,padding:"1px 5px",fontWeight:500}}>{t}</span>)}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:11,fontWeight:700,color:A,whiteSpace:"nowrap"}}>{fmt(a.m,a.dv)}</div>
                            <div style={{fontSize:9,color:MU}}>{a.yr}</div>
                          </div>
                          <a href={driveUrl(a.fid)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                            style={{flexShrink:0,width:28,height:28,borderRadius:6,background:"#1C2B4B",color:W,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}
                            onMouseOver={e=>e.currentTarget.style.opacity=".7"}
                            onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                            <IcLink/>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DRAWER FILTRES MOBILE — slide from bottom */}
      {showFilters&&(
        <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,background:"rgba(28,43,75,.55)"}} onClick={()=>setShowFilters(false)}/>
          <div style={{background:W,borderRadius:"20px 20px 0 0",maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.18)"}}>
            {/* handle + header */}
            <div style={{display:"flex",justifyContent:"center",paddingTop:10,paddingBottom:4}}>
              <div style={{width:36,height:4,background:BD,borderRadius:2}}/>
            </div>
            <div style={{background:"#1C2B4B",margin:"0 0 0 0",padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,fontWeight:700,color:W}}>Critères AO</span>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {hasFilter&&<button onClick={()=>{reset();}} style={{background:"none",border:"none",color:"rgba(255,255,255,.7)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Réinitialiser</button>}
                <button onClick={()=>setShowFilters(false)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:6,color:W,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><IcClose/></button>
              </div>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              <FilterContent/>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RÉSULTAT — slide from bottom */}
      {showRes&&(
        <div style={{position:"fixed",inset:0,background:"rgba(28,43,75,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={()=>setShowRes(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:W,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:660,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
            <div style={{display:"flex",justifyContent:"center",paddingTop:10,paddingBottom:4}}><div style={{width:36,height:4,background:"rgba(255,255,255,.4)",borderRadius:2}}/></div>
            <div style={{background:A,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:theme.key==="D1"?"#1C2B4B":W}}>{selAtts.length} attestation{selAtts.length>1?"s":""} sélectionnée{selAtts.length>1?"s":""}</div>
                <div style={{fontSize:11,color:theme.key==="D1"?"rgba(28,43,75,.7)":"rgba(255,255,255,.75)",marginTop:1}}>Liens Drive directs</div>
              </div>
              <button onClick={()=>setShowRes(false)} style={{background:"rgba(0,0,0,.15)",border:"none",borderRadius:6,color:theme.key==="D1"?"#1C2B4B":W,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><IcClose/></button>
            </div>
            <div style={{overflowY:"auto",padding:"18px 20px",flex:1}}>
              {groupBy(selAtts).map((g,gi,arr)=>(
                <div key={g.ann} style={{marginBottom:gi<arr.length-1?22:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:4,height:18,background:A,borderRadius:2}}/>
                    <div style={{fontSize:13,fontWeight:700,color:"#1C2B4B"}}>{g.ann}</div>
                    <span style={{background:`${A}20`,color:theme.key==="D1"?"#1C2B4B":A,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{g.items.length}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {g.items.map((a,i)=>(
                      <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:BG,borderRadius:8,border:`1px solid ${BD}`}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:i===0?A:"#1C2B4B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:i===0&&theme.key==="D1"?"#1C2B4B":W,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:500,color:"#1C2B4B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.lbl}</div>
                          <div style={{fontSize:10,color:MU,marginTop:1}}>{a.yr} · {fmtFull(a.m,a.dv)}</div>
                        </div>
                        <a href={driveUrl(a.fid)} target="_blank" rel="noopener noreferrer"
                          style={{display:"inline-flex",alignItems:"center",gap:5,background:"#1C2B4B",color:W,borderRadius:6,padding:"7px 13px",fontSize:11,fontWeight:600,textDecoration:"none",flexShrink:0}}>
                          <IcLink/> Ouvrir
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${BD}`,padding:"12px 20px",display:"flex",justifyContent:"flex-end",flexShrink:0}}>
              <button onClick={()=>setShowRes(false)} style={{background:LT,border:`1px solid ${BD}`,borderRadius:6,padding:"9px 20px",fontSize:12,fontWeight:600,color:"#1C2B4B",cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILS ──────────────────────────────────────────────────────────────────

const AGENCY_COLORS = {
  "PR Media":   "#E8392A",
  "D1":         "#F7BE00",
  "DPR Event":  "#6B7FA3",
};

const MAX_EXP = 35;
const NIVEAUX = ["Bac+2","Bac+3","Bac+5","Bac+8"];

function detectNiveau(diplomes) {
  const t = (diplomes || []).join(" ").toLowerCase();
  if (/doctorat|ph\.?d|thèse/.test(t)) return "Bac+8";
  if (/master|mastère|mba|ingénieur|dess|dea|grande école/.test(t)) return "Bac+5";
  if (/licence|bachelor|l3/.test(t)) return "Bac+3";
  if (/bts|dut|deug/.test(t)) return "Bac+2";
  return null;
}

async function downloadZip(profiles) {
  const zip = new JSZip();
  await Promise.all(profiles.map(async p => {
    const url = `/cvs/${encodeURIComponent(p.agency)}/${encodeURIComponent(p.file)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${p.file}`);
    zip.file(p.file, await res.blob());
  }));
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `profils-ao-${new Date().toISOString().slice(0,10)}.zip`;
  a.click();
}

function ProfileCard({ profile, sel, onToggle, accent }) {
  const ac = AGENCY_COLORS[profile.agency] || MU;
  return (
    <div onClick={onToggle} style={{
      background: W, border: `1.5px solid ${sel ? accent : BD}`,
      borderRadius: 10, padding: "14px", cursor: "pointer",
      boxShadow: sel ? `0 0 0 3px ${accent}18` : "0 1px 4px rgba(0,0,0,.04)",
      transition: "all .15s", display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
          border: `2px solid ${sel ? accent : BD}`, background: sel ? accent : W,
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all .12s",
        }}>
          {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1C2B4B", marginBottom: 3 }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: MU, lineHeight: 1.4 }}>{profile.job_title}</div>
        </div>
      </div>
      {/* meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: `${ac}18`, color: ac, border: `1px solid ${ac}40` }}>{profile.agency}</span>
        <span style={{ fontSize: 10, color: MU, fontWeight: 600 }}>{profile.years_of_experience} ans exp.</span>
      </div>
      {/* diplomes */}
      {profile.diplomes?.length > 0 && (
        <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {profile.diplomes.slice(0, 2).map((d, i) => (
            <div key={i} style={{ fontSize: 10, color: MU, lineHeight: 1.4 }}>{d}</div>
          ))}
          {profile.diplomes.length > 2 && (
            <div style={{ fontSize: 10, color: MU, fontStyle: "italic" }}>+{profile.diplomes.length - 2} autre{profile.diplomes.length - 2 > 1 ? "s" : ""}</div>
          )}
        </div>
      )}
    </div>
  );
}

function Profiles({ theme }) {
  const A = theme.accent;
  const [query, setQuery]             = useState("");
  const [selAgency, setSelAgency]     = useState("Tous");
  const [expMin, setExpMin]           = useState(0);
  const [expMax, setExpMax]           = useState(MAX_EXP);
  const [selNiveaux, setSelNiveaux]   = useState([]);
  const [sortProfiles, setSortProfiles] = useState("name");
  const [selIds, setSelIds]           = useState([]);
  const [downloading, setDl]          = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const agencies = useMemo(() => ["Tous", ...Object.keys(AGENCY_COLORS)], []);

  const filtered = useMemo(() => {
    let list = profilesData.filter(p => {
      if (selAgency !== "Tous" && p.agency !== selAgency) return false;
      if (expMin > 0 || expMax < MAX_EXP) {
        const e = p.years_of_experience;
        if (e === null || e < expMin || e > expMax) return false;
      }
      if (selNiveaux.length && !selNiveaux.includes(detectNiveau(p.diplomes))) return false;
      if (query) {
        const q = query.toLowerCase();
        const dipl = (p.diplomes || []).join(" ").toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.job_title.toLowerCase().includes(q) && !dipl.includes(q)) return false;
      }
      return true;
    });
    if (sortProfiles === "name") list = [...list].sort((a,b) => a.name.localeCompare(b.name,"fr"));
    else if (sortProfiles === "exp") list = [...list].sort((a,b) => (b.years_of_experience||0)-(a.years_of_experience||0));
    else if (sortProfiles === "agency") list = [...list].sort((a,b) => a.agency.localeCompare(b.agency,"fr"));
    return list;
  }, [query, selAgency, expMin, expMax, selNiveaux, sortProfiles]);

  const toggle   = id => setSelIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const allSel   = filtered.length > 0 && filtered.every(p => selIds.includes(p.file));
  const toggleAll = () => allSel ? setSelIds([]) : setSelIds(filtered.map(p => p.file));
  const hasFilter = query || selAgency !== "Tous" || expMin > 0 || expMax < MAX_EXP || selNiveaux.length;
  const reset    = () => { setQuery(""); setSelAgency("Tous"); setExpMin(0); setExpMax(MAX_EXP); setSelNiveaux([]); };


  const bac5Count = useMemo(() => profilesData.filter(p=>detectNiveau(p.diplomes)==="Bac+5").length, []);
  const togNiveau = n => setSelNiveaux(p => p.includes(n) ? p.filter(x=>x!==n) : [...p,n]);

  const selProfiles = profilesData.filter(p => selIds.includes(p.file));

  const handleDownload = async () => {
    setDl(true);
    try { await downloadZip(selProfiles); }
    catch (e) { console.error(e); alert("Erreur lors du téléchargement : " + e.message); }
    finally { setDl(false); }
  };

  const inp = { width: "100%", background: BG, border: `1.5px solid ${BD}`, borderRadius: 6, color: "#1C2B4B", fontFamily: "inherit", fontSize: 13, padding: "9px 11px", outline: "none" };

  const FilterContent = () => (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Agence */}
      <div>
        <div style={{ fontSize: 10, color: MU, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 }}>Agence</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {agencies.map(ag => (
            <button key={ag} onClick={() => setSelAgency(ag)} style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${selAgency === ag ? A : BD}`,
              background: selAgency === ag ? `${A}20` : W,
              color: selAgency === ag ? (theme.key === "D1" ? "#1C2B4B" : A) : MU,
              transition: "all .12s",
            }}>{ag}</button>
          ))}
        </div>
      </div>
      {/* Niveau formation */}
      <div>
        <div style={{ fontSize: 10, color: MU, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 }}>Niveau de formation</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {NIVEAUX.map(n => (
            <button key={n} onClick={() => togNiveau(n)} style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${selNiveaux.includes(n) ? A : BD}`,
              background: selNiveaux.includes(n) ? `${A}20` : W,
              color: selNiveaux.includes(n) ? (theme.key === "D1" ? "#1C2B4B" : A) : MU,
              transition: "all .12s",
            }}>{n}</button>
          ))}
        </div>
      </div>
      {/* Expérience min/max */}
      <div>
        <div style={{ fontSize:10, color:MU, textTransform:"uppercase", letterSpacing:".1em", fontWeight:700, marginBottom:8 }}>Expérience (ans)</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input type="number" min={0} max={MAX_EXP} placeholder="Min" value={expMin === 0 ? "" : expMin}
            onChange={e => setExpMin(e.target.value === "" ? 0 : Math.min(+e.target.value, expMax-1))}
            style={{ ...inp, width:"50%" }}/>
          <span style={{ fontSize:11, color:MU }}>—</span>
          <input type="number" min={0} max={MAX_EXP} placeholder="Max" value={expMax === MAX_EXP ? "" : expMax}
            onChange={e => setExpMax(e.target.value === "" ? MAX_EXP : Math.max(+e.target.value, expMin+1))}
            style={{ ...inp, width:"50%" }}/>
        </div>
      </div>
      {/* Actions */}
      <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => { toggleAll(); setShowFilters(false); }} style={{ background: `${A}20`, border: `1.5px solid ${A}40`, borderRadius: 6, color: theme.key === "D1" ? "#1C2B4B" : A, padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          {allSel ? `✕ Désélectionner (${filtered.length})` : `✓ Tout sélectionner (${filtered.length})`}
        </button>
        {hasFilter && <button onClick={reset} style={{ background: LT, border: `1.5px solid ${BD}`, borderRadius: 6, color: MU, padding: "9px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>Réinitialiser les filtres</button>}
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fi .4s ease" }}>
      {/* KPI strip */}
      <div className="kpi-grid" style={{ marginBottom: 18 }}>
        <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 10, padding: "16px", borderLeft: `4px solid ${A}` }}>
          <div style={{ fontSize: 9, color: MU, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 }}>Total profils</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1C2B4B", fontFamily: "Georgia,serif", lineHeight: 1 }}>{profilesData.length}</div>
          <div style={{ fontSize: 10, color: MU, marginTop: 4 }}>CVs disponibles</div>
        </div>
        <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 10, padding: "16px", borderLeft: `4px solid #22C55E` }}>
          <div style={{ fontSize: 9, color: MU, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 8 }}>Bac+5</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1C2B4B", fontFamily: "Georgia,serif", lineHeight: 1 }}>{bac5Count}</div>
          <div style={{ fontSize: 10, color: MU, marginTop: 4 }}>profils Master+</div>
        </div>
      </div>
      {/* search + filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><IcSrch /></div>
          <input type="text" placeholder="Nom, poste, diplôme…" value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: "100%", background: W, border: `1.5px solid ${query ? A : BD}`, borderRadius: 8, color: "#1C2B4B", fontFamily: "inherit", fontSize: 13, padding: "11px 38px 11px 40px", outline: "none", transition: "all .15s" }} />
          {query && <button onClick={() => setQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: MU, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>}
        </div>
        <button onClick={() => setShowFilters(true)} style={{
          background: hasFilter ? A : W, color: hasFilter ? (theme.key === "D1" ? "#1C2B4B" : "#fff") : MU,
          border: `1.5px solid ${hasFilter ? A : BD}`, borderRadius: 8, padding: "0 14px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 600, fontFamily: "inherit", flexShrink: 0,
        }}>
          <IcFilter /> Filtres{hasFilter ? " (actifs)" : ""}
        </button>
      </div>

      {/* results bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1C2B4B" }}>{filtered.length} profil{filtered.length > 1 ? "s" : ""}</span>
          {hasFilter && <span style={{ background: `${A}20`, color: theme.key === "D1" ? "#1C2B4B" : A, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>Filtré</span>}
          <div style={{ display:"flex", background:LT, borderRadius:6, padding:2, gap:1, marginLeft:4 }}>
            {[["name","A→Z"],["exp","Exp ↓"],["agency","Agence"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSortProfiles(v)} style={{ padding:"3px 9px", borderRadius:4, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600, background:sortProfiles===v?W:"transparent", color:sortProfiles===v?"#1C2B4B":MU, boxShadow:sortProfiles===v?"0 1px 3px rgba(0,0,0,.1)":"none", transition:"all .15s" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleAll} style={{ background: W, color: MU, border: `1.5px solid ${BD}`, borderRadius: 6, padding: "7px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {allSel ? "Désélectionner tout" : "Sélectionner tout"}
          </button>
          {selIds.length > 0 && (
            <button onClick={handleDownload} disabled={downloading} style={{
              background: A, color: theme.key === "D1" ? "#1C2B4B" : "#fff", border: "none",
              borderRadius: 7, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
              boxShadow: `0 3px 12px ${A}40`, opacity: downloading ? .6 : 1,
            }}>
              <IcDl /> {downloading ? "Préparation…" : `${selIds.length} CV${selIds.length > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>

      {/* desktop layout */}
      <div className="search-layout">
        {/* sidebar */}
        <div className="sidebar-desktop" style={{ background: W, border: `1px solid ${BD}`, borderRadius: 10, overflow: "hidden", position: "sticky", top: 72 }}>
          <div style={{ background: "#1C2B4B", padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: W }}>Filtres</span>
            {hasFilter && <button onClick={reset} style={{ background: "none", border: "none", color: "rgba(255,255,255,.65)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Réinitialiser</button>}
          </div>
          <FilterContent />
        </div>

        {/* grid */}
        <div className="search-results">
          {filtered.length === 0
            ? <div style={{ textAlign: "center", padding: 50, color: MU, background: W, borderRadius: 10, border: `1px solid ${BD}` }}>Aucun profil ne correspond.</div>
            : <div className="profiles-grid">
                {filtered.map(p => (
                  <ProfileCard key={p.file} profile={p} sel={selIds.includes(p.file)} onToggle={() => toggle(p.file)} accent={A} />
                ))}
              </div>
          }
        </div>
      </div>

      {/* mobile filter drawer */}
      {showFilters && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, background: "rgba(28,43,75,.55)" }} onClick={() => setShowFilters(false)} />
          <div style={{ background: W, borderRadius: "20px 20px 0 0", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px rgba(0,0,0,.18)" }}>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, background: BD, borderRadius: 2 }} />
            </div>
            <div style={{ background: "#1C2B4B", padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: W }}>Filtres</span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {hasFilter && <button onClick={reset} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Réinitialiser</button>}
                <button onClick={() => setShowFilters(false)} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 6, color: W, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IcClose /></button>
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APPELS D'OFFRES ─────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  if (!value || value === "null" || (typeof value === "string" && value.trim() === "")) return null;
  return (
    <div style={{display:"flex",gap:10,fontSize:12,lineHeight:1.5}}>
      <span style={{color:MU,fontWeight:600,flexShrink:0,minWidth:130}}>{label}</span>
      <span style={{color:"#1C2B4B"}}>{value}</span>
    </div>
  );
}

function AOCard({ ao }) {
  const deadline = parseDeadline(ao.date_end);
  const days     = daysUntil(deadline);
  const est      = parseEstimation(ao.estimation);
  const caut     = parseCaution(ao.caution_provisoire);
  const title    = cleanIntitule(ao.intitule);
  const mc       = AO_MODE_COLOR[ao.mode] || MU;
  const expired  = days !== null && days < 0;

  const dlColor = days === null ? MU : days < 0 ? "#9CA3AF" : days === 0 ? "#DC2626" : days <= 3 ? "#DC2626" : days <= 7 ? "#F59E0B" : "#16A34A";
  const dlLabel = days === null ? null : days < 0 ? "Expiré" : days === 0 ? "Aujourd'hui !" : `dans ${days}j`;

  const dateDisplay = ao.date_end ? ao.date_end.replace(" ...","").trim() : "";
  const modePass    = cleanMode(ao.mode_passation);

  return (
    <div style={{
      background: expired ? "#FAFAFA" : W,
      border:`1px solid ${!expired && days !== null && days <= 3 ? "#FCA5A5" : BD}`,
      borderLeft:`4px solid ${expired ? "#D1D5DB" : mc}`,
      borderRadius:10, padding:"20px 22px", display:"flex", flexDirection:"column", gap:14,
      opacity: expired ? .72 : 1,
    }}>

      {/* ── Header ── */}
      <div style={{display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:4,flexShrink:0,background:`${mc}18`,color:mc,border:`1px solid ${mc}40`}}>{ao.mode}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:800,color:"#1C2B4B",lineHeight:1.3}}>{ao.acheteur}</div>
          <div style={{fontSize:11,color:MU,marginTop:3}}>
            Réf. <strong>{ao.reference}</strong>
            {ao.type_procedure && <> · {ao.type_procedure}</>}
            {modePass && <> · {modePass}</>}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
          {dlLabel && (
            <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${dlColor}15`,color:dlColor,border:`1px solid ${dlColor}40`}}>{dlLabel}</span>
          )}
          {ao.reserve_pme === "Oui" && (
            <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,color:"#16A34A",background:"#DCFCE7",border:"1px solid #BBF7D0"}}>PME réservé</span>
          )}
        </div>
      </div>

      {/* ── Intitulé ── */}
      <div style={{fontSize:13,color:"#1C2B4B",lineHeight:1.6,borderLeft:`2px solid ${mc}30`,paddingLeft:12}}>{title}</div>

      {/* ── Lieu ── */}
      {ao.lieu && <div style={{fontSize:12,color:MU}}>📍 {ao.lieu}</div>}

      {/* ── Financials ── */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {est !== null && (
          <div style={{flex:"1 1 140px",background:BG,borderRadius:8,padding:"10px 14px",border:`1px solid ${BD}`}}>
            <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:4}}>Estimation</div>
            <div style={{fontSize:16,fontWeight:800,color:"#16A34A",fontFamily:"Georgia,serif"}}>{fmtMAD(est)}</div>
            <div style={{fontSize:10,color:MU,marginTop:2}}>{new Intl.NumberFormat("fr-MA").format(Math.round(est))} DH</div>
          </div>
        )}
        {caut !== null && (
          <div style={{flex:"1 1 140px",background:BG,borderRadius:8,padding:"10px 14px",border:`1px solid ${BD}`}}>
            <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:4}}>Caution provisoire</div>
            <div style={{fontSize:16,fontWeight:800,color:"#F59E0B",fontFamily:"Georgia,serif"}}>{fmtMAD(caut)}</div>
            <div style={{fontSize:10,color:MU,marginTop:2}}>{new Intl.NumberFormat("fr-MA").format(Math.round(caut))} DH</div>
          </div>
        )}
        {ao.prix_dossier && ao.prix_dossier !== "0,00 MAD" && (
          <div style={{flex:"1 1 120px",background:BG,borderRadius:8,padding:"10px 14px",border:`1px solid ${BD}`}}>
            <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:4}}>Prix dossier</div>
            <div style={{fontSize:16,fontWeight:800,color:"#1C2B4B",fontFamily:"Georgia,serif"}}>{ao.prix_dossier}</div>
          </div>
        )}
        <div style={{flex:"1 1 120px",background:BG,borderRadius:8,padding:"10px 14px",border:`1px solid ${!expired && days !== null && days <= 3 ? "#FCA5A5" : BD}`}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:4}}>Date limite</div>
          <div style={{fontSize:13,fontWeight:700,color:dlColor,lineHeight:1.3}}>{dateDisplay}</div>
        </div>
      </div>

      {/* ── Logistique ── */}
      <div style={{display:"flex",flexDirection:"column",gap:6,borderTop:`1px solid ${BD}`,paddingTop:12}}>
        <InfoRow label="Retrait / dépôt"   value={ao.adresse_retrait !== ao.adresse_depot ? ao.adresse_retrait : ao.adresse_retrait}/>
        <InfoRow label="Lieu d'ouverture"  value={ao.lieu_ouverture}/>
        {ao.variante && ao.variante !== "null" && <InfoRow label="Variante" value={ao.variante}/>}
      </div>

      {/* ── Contact ── */}
      {(ao.contact || ao.email || ao.telephone) && (
        <div style={{display:"flex",gap:16,flexWrap:"wrap",background:`${AO_ACCENT}08`,border:`1px solid ${AO_ACCENT}20`,borderRadius:8,padding:"10px 14px"}}>
          {ao.contact  && <span style={{fontSize:12,color:"#1C2B4B",fontWeight:600}}>👤 {ao.contact}</span>}
          {ao.email    && <a href={`mailto:${ao.email}`}    style={{fontSize:12,color:AO_ACCENT,textDecoration:"none"}}>✉ {ao.email}</a>}
          {ao.telephone&& <a href={`tel:${ao.telephone}`}   style={{fontSize:12,color:AO_ACCENT,textDecoration:"none"}}>📞 {ao.telephone}</a>}
          {ao.fax      && <span style={{fontSize:12,color:MU}}>🖷 {ao.fax}</span>}
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{display:"flex",gap:8,paddingTop:2}}>
        <a href={ao.url} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#1C2B4B",color:W,borderRadius:7,padding:"10px 14px",fontSize:12,fontWeight:700,textDecoration:"none"}}>
          <IcLink/> Consulter la fiche
        </a>
        {ao.dce_url && (
          <a href={ao.dce_url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:BG,border:`1px solid ${BD}`,color:"#1C2B4B",borderRadius:7,padding:"10px 16px",fontSize:12,fontWeight:600,textDecoration:"none"}}>
            <IcDl/> Télécharger DCE
          </a>
        )}
      </div>
    </div>
  );
}

const AO_KEYWORDS = [
    { cat:"PR Media", color:"#E8392A", kws:[
    "relations publiques","agence de presse","relations presse","relations médias",
    "attaché de presse","veille médiatique","système de veille médiatique","monitoring presse",
    "revue de presse","communication de crise","gestion de la communication de crise",
    "communication institutionnelle","bilan d'image","réputation","e-réputation",
    "conférence de presse","communiqué de presse","dossier de presse","media training",
    "accompagnement presse","conseil institutionnel","conseil en communication",
    "élaboration plan de communication","mise en oeuvre du plan de communication",
    "stratégie de communication","accompagnement en communication",
    "assistance à maîtrise d'ouvrage communication","communication et sensibilisation",
    "guide de communication","charte de communication",
    "appel à manifestation d'intérêt communication",
  ]},
    { cat:"D1 Social", color:"#C4971A", kws:[
    "agence digitale","gestion réseaux sociaux","community management","campagne digitale",
    "campagne d'influence","influence marketing","influenceurs","achat média digital",
    "achat d'espaces publicitaires","achat d'espace publicitaire en ligne",
    "conseil média et achat d'espace","plan média","production audiovisuelle",
    "production de films institutionnels","films promotionnels","production spots publicitaires",
    "production de capsules","capsules institutionnelles","capsules vidéo",
    "production et diffusion de contenu","stratégie de contenu","content marketing",
    "supports et outils de communication","conception adaptation impression supports",
    "campagne de sensibilisation","marketing territorial","promotion offline et digitale",
    "communication offline et digitale","communication digitale","panneaux publicitaires",
    "affichage publicitaire","habillage","branding","identité visuelle","charte graphique",
    "design graphique","refonte site web","promotion et visibilité institutionnelle",
    "360°","accompagnement communication",
  ]},
  { cat:"DPR Event", color:"#6B7FA3", kws:[
    "événement","organisation événement","organisation séminaire","organisation conférence",
    "organisation salon","organisation forum","organisation congrès","participation salon international",
    "gestion logistique événement","activation événementielle","roadshow","visite de prospection",
    "inauguration","convention d'entreprise","team building","journée portes ouvertes","gala",
    "soirée de remise de prix","organisation cérémonie officielle","manifestation artistique",
    "manifestation culturelle","organisation festival","aménagement de stands","pavillon du Maroc",
    "pavillon national","scénographie","location matériel scénique","sonorisation",
    "éclairage événementiel","prestations techniques événementielles","chapiteaux","tente caïdale",
    "pavoisement","caravane nationale","tournée régionale","animation pavillon","animation stand",
    "cérémonie de remise des prix","réception hébergement restauration événement",
    "journée d'étude","atelier","rencontre","event management","prestation événementielle",
    "caravane","street marketing",
  ]}
];

function AOsPage() {
  const A = AO_ACCENT;
  const [query,      setQuery]      = useState("");
  const [selModes,   setSelModes]   = useState([]);
  const [sortBy,     setSortBy]     = useState("deadline");
  const [pmeOnly,    setPmeOnly]    = useState(false);
  const [hideExpired,setHideExpired]= useState(false);
  const [minEst,     setMinEst]     = useState("");
  const [maxEst,     setMaxEst]     = useState("");
  const [minCaut,    setMinCaut]    = useState("");
  const [maxCaut,    setMaxCaut]    = useState("");
  const [scrapedDate,setScrapedDate]= useState(()=>new Date().toISOString().slice(0,10));
  const [selKeywords,setSelKeywords]= useState([]);
  const [kwOpen,     setKwOpen]     = useState(false);

  const norm   = s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  const aoText = ao=>norm([ao.intitule,ao.acheteur,ao.reference,ao.lieu,ao.type_procedure,ao.mode_passation,ao.adresse_retrait,ao.lieu_ouverture,ao.contact].filter(Boolean).join(" "));
  const togKw  = kw=>setSelKeywords(p=>p.includes(kw)?p.filter(x=>x!==kw):[...p,kw]);

  const ALL_MODES   = useMemo(()=>[...new Set(AOS.map(a=>a.mode).filter(Boolean))].sort(),[]);
  const modeCounts  = useMemo(()=>{ const c={}; AOS.forEach(a=>{c[a.mode]=(c[a.mode]||0)+1;}); return c; },[]);
  const urgentCount = useMemo(()=>AOS.filter(a=>{ const d=daysUntil(parseDeadline(a.date_end)); return d!==null&&d>=0&&d<=7; }).length,[]);
  const todayStr    = new Date().toISOString().slice(0,10);
  const todayCount  = useMemo(()=>AOS.filter(a=>a.scraped_at&&a.scraped_at.slice(0,10)===todayStr).length,[todayStr]);

  const filtered = useMemo(()=>{
    let list = AOS;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(a=>
        a.acheteur?.toLowerCase().includes(q) ||
        cleanIntitule(a.intitule).toLowerCase().includes(q) ||
        a.reference?.toLowerCase().includes(q)
      );
    }
    if (selModes.length) list = list.filter(a=>selModes.includes(a.mode));
    if (pmeOnly) list = list.filter(a=>a.reserve_pme==="Oui");
    if (hideExpired) list = list.filter(a=>{ const d=daysUntil(parseDeadline(a.date_end)); return d===null||d>=0; });
    if (minEst) list = list.filter(a=>{ const e=parseEstimation(a.estimation); return e!==null&&e>=parseFloat(minEst); });
    if (maxEst) list = list.filter(a=>{ const e=parseEstimation(a.estimation); return e!==null&&e<=parseFloat(maxEst); });
    if (minCaut) list = list.filter(a=>{ const c=parseCaution(a.caution_provisoire); return c!==null&&c>=parseFloat(minCaut); });
    if (maxCaut) list = list.filter(a=>{ const c=parseCaution(a.caution_provisoire); return c!==null&&c<=parseFloat(maxCaut); });
    if (scrapedDate) list = list.filter(a=>a.scraped_at&&a.scraped_at.slice(0,10)===scrapedDate);
    if (selKeywords.length) list = list.filter(a=>{ const t=aoText(a); return selKeywords.some(kw=>kw.split(" ").every(token=>t.includes(norm(token)))); });
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[query,selModes,pmeOnly,hideExpired,minEst,maxEst,minCaut,maxCaut,scrapedDate,selKeywords]);

  const sorted = useMemo(()=>{
    const list = [...filtered];
    const now  = new Date();
    if (sortBy==="deadline") {
      list.sort((a,b)=>{
        const da=parseDeadline(a.date_end), db=parseDeadline(b.date_end);
        if (!da&&!db) return 0; if (!da) return 1; if (!db) return -1;
        const ae=da<now, be=db<now;
        if (ae&&!be) return 1; if (!ae&&be) return -1;
        return da-db;
      });
    } else if (sortBy==="estimation") {
      list.sort((a,b)=>(parseEstimation(b.estimation)||0)-(parseEstimation(a.estimation)||0));
    } else if (sortBy==="caution") {
      list.sort((a,b)=>(parseCaution(b.caution_provisoire)||0)-(parseCaution(a.caution_provisoire)||0));
    } else {
      list.sort((a,b)=>(a.acheteur||"").localeCompare(b.acheteur||"","fr"));
    }
    return list;
  },[filtered,sortBy]);

  const togMode   = m=>setSelModes(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m]);
  const hasFilter = query||selModes.length||pmeOnly||hideExpired||minEst||maxEst||minCaut||maxCaut||scrapedDate||selKeywords.length;
  const reset     = ()=>{ setQuery(""); setSelModes([]); setPmeOnly(false); setHideExpired(false); setMinEst(""); setMaxEst(""); setMinCaut(""); setMaxCaut(""); setScrapedDate(""); setSelKeywords([]); };

  const numInput = (value, setter, placeholder) => (
    <input value={value} onChange={e=>setter(e.target.value)} type="number" placeholder={placeholder}
      style={{width:110,background:BG,border:`1px solid ${BD}`,borderRadius:6,padding:"7px 10px",fontSize:12,color:"#1C2B4B",fontFamily:"inherit",outline:"none"}}/>
  );

  return (
    <div style={{animation:"fi .4s ease"}}>
      {/* KPI strip */}
      <div className="kpi-grid" style={{marginBottom:18}}>
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",borderLeft:`4px solid ${A}`}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Total AOs</div>
          <div style={{fontSize:22,fontWeight:800,color:"#1C2B4B",fontFamily:"Georgia,serif",lineHeight:1}}>{AOS.length}</div>
          <div style={{fontSize:10,color:MU,marginTop:4}}>consultations</div>
        </div>
        <div style={{background:W,border:`1px solid ${urgentCount>0?"#FCA5A5":BD}`,borderRadius:10,padding:"16px",borderLeft:`4px solid ${urgentCount>0?"#F59E0B":BD}`}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Urgent ≤7j</div>
          <div style={{fontSize:22,fontWeight:800,color:urgentCount>0?"#F59E0B":"#1C2B4B",fontFamily:"Georgia,serif",lineHeight:1}}>{urgentCount}</div>
        </div>
        <div style={{background:W,border:`1px solid ${todayCount>0?"#BBF7D0":BD}`,borderRadius:10,padding:"16px",borderLeft:`4px solid ${todayCount>0?"#22C55E":BD}`}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Ajoutés aujourd'hui</div>
          <div style={{fontSize:22,fontWeight:800,color:todayCount>0?"#16A34A":"#1C2B4B",fontFamily:"Georgia,serif",lineHeight:1}}>{todayCount}</div>
          <div style={{fontSize:10,color:MU,marginTop:4}}>nouveaux appels d'offres</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",marginBottom:14,display:"flex",flexDirection:"column",gap:12}}>

        {/* Row 1: search + sort */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 220px",display:"flex",alignItems:"center",gap:8,background:BG,border:`1px solid ${BD}`,borderRadius:7,padding:"8px 12px"}}>
            <IcSrch/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Acheteur, objet, référence…"
              style={{border:"none",background:"transparent",outline:"none",fontSize:13,color:"#1C2B4B",width:"100%",fontFamily:"inherit"}}/>
            {query&&<button onClick={()=>setQuery("")} style={{border:"none",background:"none",cursor:"pointer",color:MU,padding:0,display:"flex",alignItems:"center"}}><IcClose/></button>}
          </div>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:BG,border:`1px solid ${BD}`,borderRadius:7,padding:"8px 12px",fontSize:12,color:"#1C2B4B",fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            <option value="deadline">Tri : Date limite</option>
            <option value="estimation">Tri : Estimation ↓</option>
            <option value="caution">Tri : Caution ↓</option>
            <option value="acheteur">Tri : Acheteur A→Z</option>
          </select>
        </div>

        {/* Row 2: mode chips + checkboxes */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:10,color:MU,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Mode :</span>
          {ALL_MODES.map(m=>(
            <button key={m} onClick={()=>togMode(m)} style={{
              padding:"4px 10px",borderRadius:20,border:`1.5px solid ${selModes.includes(m)?AO_MODE_COLOR[m]:BD}`,
              background:selModes.includes(m)?`${AO_MODE_COLOR[m]}18`:W,
              color:selModes.includes(m)?AO_MODE_COLOR[m]:MU,
              fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",
            }}>{m} <span style={{opacity:.6}}>({modeCounts[m]||0})</span></button>
          ))}
          <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:MU,cursor:"pointer",marginLeft:6}}>
            <input type="checkbox" checked={pmeOnly} onChange={e=>setPmeOnly(e.target.checked)} style={{accentColor:A}}/>PME réservé
          </label>
          <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:MU,cursor:"pointer"}}>
            <input type="checkbox" checked={hideExpired} onChange={e=>setHideExpired(e.target.checked)} style={{accentColor:A}}/>Masquer expirés
          </label>
        </div>

        {/* Row 3: range filters */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",paddingTop:4,borderTop:`1px solid ${BD}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:MU,fontWeight:600,whiteSpace:"nowrap"}}>Estimation (DH) :</span>
            {numInput(minEst, setMinEst, "Min")}
            <span style={{fontSize:11,color:MU}}>—</span>
            {numInput(maxEst, setMaxEst, "Max")}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:MU,fontWeight:600,whiteSpace:"nowrap"}}>Caution (DH) :</span>
            {numInput(minCaut, setMinCaut, "Min")}
            <span style={{fontSize:11,color:MU}}>—</span>
            {numInput(maxCaut, setMaxCaut, "Max")}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:MU,fontWeight:600,whiteSpace:"nowrap"}}>Ajouté le :</span>
            <input type="date" value={scrapedDate} onChange={e=>setScrapedDate(e.target.value)}
              style={{background:scrapedDate?`${A}12`:BG,border:`1.5px solid ${scrapedDate?A:BD}`,borderRadius:6,padding:"6px 10px",fontSize:12,color:"#1C2B4B",fontFamily:"inherit",outline:"none",cursor:"pointer"}}/>
            {scrapedDate&&<button onClick={()=>setScrapedDate("")} style={{border:"none",background:"none",cursor:"pointer",color:MU,padding:0,display:"flex",alignItems:"center"}}><IcClose/></button>}
          </div>
          {hasFilter&&<button onClick={reset} style={{marginLeft:"auto",border:"none",background:"none",color:A,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Réinitialiser tout</button>}
        </div>

        {/* Row 4: keyword filters */}
        <div style={{borderTop:`1px solid ${BD}`,paddingTop:10}}>
          <button onClick={()=>setKwOpen(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontSize:11,fontWeight:700,color:selKeywords.length?A:MU,padding:0}}>
            <IcFilter/> Mots-clés métier{selKeywords.length?` (${selKeywords.length} actif${selKeywords.length>1?"s":""})`:""} <span style={{fontSize:9,marginLeft:2}}>{kwOpen?"▲":"▼"}</span>
          </button>
          {kwOpen&&(
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:12}}>
              {AO_KEYWORDS.map(({cat,color,kws})=>(
                <div key={cat}>
                  <div style={{fontSize:9,color,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:5}}>{cat}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {kws.map(kw=>(
                      <button key={kw} onClick={()=>togKw(kw)} style={{
                        padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",
                        border:`1.5px solid ${selKeywords.includes(kw)?color:BD}`,
                        background:selKeywords.includes(kw)?`${color}18`:W,
                        color:selKeywords.includes(kw)?color:MU,
                        transition:"all .12s",
                      }}>{kw}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Count */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:13,fontWeight:700,color:"#1C2B4B"}}>{sorted.length} appel{sorted.length>1?"s":""} d'offres</span>
        {hasFilter&&<span style={{background:`${A}20`,color:A,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>Filtré</span>}
      </div>

      {/* List */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {sorted.length===0
          ? <div style={{textAlign:"center",padding:50,color:MU,background:W,borderRadius:10,border:`1px solid ${BD}`}}>Aucun appel d'offres ne correspond.</div>
          : sorted.map(ao=><AOCard key={ao.reference+ao.acheteur} ao={ao}/>)
        }
      </div>
    </div>
  );
}

// ─── AWARDS PAGE ─────────────────────────────────────────────────────────────
function AwardCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const isPV    = rec.award_source === "EXTRAIT_PV";
  const accent  = isPV ? "#16A34A" : "#D97706";
  const dl      = parseAwardDeadline(rec.deadline);
  const days    = daysUntil(dl);

  const sortedEntries = useMemo(() => {
    if (!rec.award_entries?.length) return [];
    return [...rec.award_entries].sort((a,b) => {
      const am = parseAwardMontant(a.montant), bm = parseAwardMontant(b.montant);
      if (am===null&&bm===null) return 0; if (am===null) return 1; if (bm===null) return -1;
      return am - bm;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.award_entries]);

  const winnerAmt = isPV ? parseAwardMontant(rec.award_winner?.montant) : null;
  const dlLabel   = days===null?null:days<0?"Expiré":days===0?"Aujourd'hui":`dans ${days}j`;
  const dlColor   = days===null?MU:days<0?"#9CA3AF":days===0?"#DC2626":days<=3?"#DC2626":days<=7?"#F59E0B":"#16A34A";
  const rankSym   = i=>["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"][i]||(i+1)+".";
  const rankClr   = i=>i===0?"#CA8A04":i===1?"#9CA3AF":i===2?"#B45309":MU;
  const fmtDl     = s=>s?s.replace(/(\d{2})\/(\d{2})\/(\d{4})(\d{2}:\d{2})/,"$1/$2/$3 $4"):null;

  return (
    <div style={{background:W,border:`1px solid ${BD}`,borderLeft:`4px solid ${accent}`,borderRadius:10,padding:"18px 20px",display:"flex",flexDirection:"column",gap:12}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:4,flexShrink:0,background:`${accent}18`,color:accent,border:`1px solid ${accent}40`}}>
          {isPV?"🏆 Extrait PV":"📋 Suivi Commission"}
        </span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1C2B4B",lineHeight:1.3}}>{rec.buyer}</div>
          <div style={{fontSize:11,color:MU,marginTop:3}}>Réf. <strong>{rec.reference}</strong>{rec.location&&<> · 📍 {rec.location}</>}</div>
        </div>
        {dlLabel&&<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${dlColor}15`,color:dlColor,border:`1px solid ${dlColor}40`,flexShrink:0}}>{dlLabel}</span>}
      </div>

      {/* Object */}
      <div style={{fontSize:12,color:"#334155",lineHeight:1.6,borderLeft:`2px solid ${accent}30`,paddingLeft:10}}>{rec.object}</div>

      {/* EXTRAIT PV: winner block */}
      {isPV&&rec.award_winner&&(
        <div style={{display:"flex",alignItems:"center",gap:14,background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:8,padding:"12px 16px",flexWrap:"wrap"}}>
          <span style={{fontSize:20,flexShrink:0}}>🏆</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#15803D",marginBottom:3}}>Lauréat du marché</div>
            <div style={{fontSize:14,fontWeight:800,color:"#14532D"}}>{rec.award_winner.entreprise}</div>
          </div>
          {winnerAmt!==null?(
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#15803D",marginBottom:2}}>Montant attribué</div>
              <div style={{fontSize:18,fontWeight:800,color:"#15803D",fontFamily:"Georgia,serif"}}>{fmtMAD(winnerAmt)}</div>
              <div style={{fontSize:10,color:"#15803D90"}}>{new Intl.NumberFormat("fr-MA").format(Math.round(winnerAmt))} DH</div>
            </div>
          ):rec.award_winner.montant&&rec.award_winner.montant!=="-"&&(
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#15803D",marginBottom:2}}>Montant attribué</div>
              <div style={{fontSize:14,fontWeight:800,color:"#15803D"}}>{rec.award_winner.montant} DH</div>
            </div>
          )}
        </div>
      )}

      {/* SUIVI COMMISSION: single → inline, multiple → expand */}
      {!isPV&&rec.award_entries?.length===1&&(()=>{
        const e=sortedEntries[0]; const amt=parseAwardMontant(e.montant);
        return(
          <div style={{display:"flex",alignItems:"center",gap:14,background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:8,padding:"12px 16px",flexWrap:"wrap"}}>
            <span style={{fontSize:20,flexShrink:0}}>📋</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#B45309",marginBottom:3}}>Soumissionnaire</div>
              <div style={{fontSize:14,fontWeight:800,color:"#92400E"}}>{e.entreprise}</div>
            </div>
            {amt!==null?(
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#B45309",marginBottom:2}}>Montant proposé</div>
                <div style={{fontSize:18,fontWeight:800,color:"#D97706",fontFamily:"Georgia,serif"}}>{fmtMAD(amt)}</div>
                <div style={{fontSize:10,color:"#B4530990"}}>{new Intl.NumberFormat("fr-MA").format(Math.round(amt))} DH</div>
              </div>
            ):e.montant&&e.montant!=="-"&&(
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#B45309",marginBottom:2}}>Montant proposé</div>
                <div style={{fontSize:14,fontWeight:800,color:"#D97706"}}>{e.montant} DH</div>
              </div>
            )}
          </div>
        );
      })()}
      {!isPV&&rec.award_entries?.length>1&&(
        <div>
          <button onClick={()=>setExpanded(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:7,padding:"8px 14px",fontSize:12,fontWeight:600,color:"#B45309",cursor:"pointer",width:"100%",justifyContent:"center",fontFamily:"inherit"}}>
            {expanded?`▲ Réduire`:`▼ ${rec.award_entries.length} soumissionnaires — afficher le classement`}
          </button>
          {expanded&&(
            <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:MU,padding:"0 10px",marginBottom:2}}>Classement par montant croissant</div>
              {sortedEntries.map((e,i)=>{
                const amt=parseAwardMontant(e.montant);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",background:i===0?"#FFFBEB":BG,borderRadius:6,border:`1px solid ${i===0?"#FCD34D":BD}`}}>
                    <span style={{fontSize:13,fontWeight:800,color:rankClr(i),flexShrink:0,width:22,textAlign:"center"}}>{rankSym(i)}</span>
                    <span style={{flex:1,fontSize:12,fontWeight:600,color:"#1C2B4B",minWidth:0}}>{e.entreprise}</span>
                    <span style={{fontSize:12,fontWeight:700,color:amt?rankClr(i):MU,fontFamily:"Georgia,serif",flexShrink:0}}>{amt?fmtMAD(amt):"Non communiqué"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer: deadline + link */}
      <div style={{display:"flex",gap:8,alignItems:"center",paddingTop:4,borderTop:`1px solid ${BD}`,flexWrap:"wrap"}}>
        {rec.deadline&&<span style={{fontSize:11,color:MU,flex:1}}>📅 Échéance : <strong style={{color:dlColor}}>{fmtDl(rec.deadline)}</strong></span>}
        <a href={rec.detail_url} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",gap:6,background:"#1C2B4B",color:W,borderRadius:7,padding:"8px 14px",fontSize:11,fontWeight:700,textDecoration:"none",flexShrink:0}}>
          <IcLink/> Voir la fiche
        </a>
      </div>
    </div>
  );
}

function AwardsPage() {
  const PAGE_SIZE = 20;
  const [query,      setQuery]      = useState("");
  const [selSources, setSelSources] = useState(["EXTRAIT_PV","SUIVI_COMMISSION"]);
  const [sortBy,     setSortBy]     = useState("deadline");
  const [minMontant, setMinMontant] = useState("");
  const [maxMontant, setMaxMontant] = useState("");
  const [locFilter,  setLocFilter]  = useState("");
  const [page,       setPage]       = useState(1);

  const goPage = p => { setPage(p); window.scrollTo({top:0,behavior:"smooth"}); };
  const togSource = s => { setSelSources(p=>p.includes(s)?(p.length>1?p.filter(x=>x!==s):p):[...p,s]); setPage(1); };
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();

  const filtered = useMemo(()=>{
    let list = AWARDS;
    if (selSources.length<2) list = list.filter(x=>selSources.includes(x.award_source));
    if (query) {
      const q = norm(query);
      list = list.filter(x=>
        norm(x.buyer||"").includes(q)||
        norm(x.object||"").includes(q)||
        norm(x.reference||"").includes(q)||
        norm(x.award_winner?.entreprise||"").includes(q)||
        (x.award_entries||[]).some(e=>norm(e.entreprise||"").includes(q))
      );
    }
    if (locFilter) { const q=norm(locFilter); list=list.filter(x=>norm(x.location||"").includes(q)); }
    if (minMontant) {
      const min=parseFloat(minMontant);
      list=list.filter(x=>{
        const m=parseAwardMontant(x.award_winner?.montant);
        if (m!==null) return m>=min;
        return (x.award_entries||[]).some(e=>{const em=parseAwardMontant(e.montant);return em!==null&&em>=min;});
      });
    }
    if (maxMontant) {
      const max=parseFloat(maxMontant);
      list=list.filter(x=>{
        const m=parseAwardMontant(x.award_winner?.montant);
        if (m!==null) return m<=max;
        return (x.award_entries||[]).some(e=>{const em=parseAwardMontant(e.montant);return em!==null&&em<=max;});
      });
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[query,selSources,minMontant,maxMontant,locFilter]);

  const sorted = useMemo(()=>{
    const list=[...filtered];
    if (sortBy==="montant") {
      list.sort((a,b)=>{ const am=parseAwardMontant(a.award_winner?.montant),bm=parseAwardMontant(b.award_winner?.montant); if(am===null&&bm===null)return 0; if(am===null)return 1; if(bm===null)return -1; return bm-am; });
    } else if (sortBy==="buyer") {
      list.sort((a,b)=>(a.buyer||"").localeCompare(b.buyer||"","fr"));
    } else {
      list.sort((a,b)=>{ const da=parseAwardDeadline(a.deadline),db=parseAwardDeadline(b.deadline); if(!da&&!db)return 0; if(!da)return 1; if(!db)return -1; return db-da; });
    }
    return list;
  },[filtered,sortBy]);

  const totalPages = Math.max(1,Math.ceil(sorted.length/PAGE_SIZE));
  const paginated  = sorted.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const hasFilter  = query||selSources.length<2||minMontant||maxMontant||locFilter;
  const reset      = ()=>{ setQuery(""); setSelSources(["EXTRAIT_PV","SUIVI_COMMISSION"]); setMinMontant(""); setMaxMontant(""); setLocFilter(""); setPage(1); };

  const pageNums = ()=>{
    if (totalPages<=7) return Array.from({length:totalPages},(_,i)=>i+1);
    if (page<=4)            return [1,2,3,4,5,"…",totalPages];
    if (page>=totalPages-3) return [1,"…",totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    return [1,"…",page-1,page,page+1,"…",totalPages];
  };

  const pvCount    = filtered.filter(x=>x.award_source==="EXTRAIT_PV").length;
  const suiviCount = filtered.filter(x=>x.award_source==="SUIVI_COMMISSION").length;
  const A = AWARD_ACCENT;

  const numInput=(value,setter,ph)=>(
    <input value={value} onChange={e=>{setter(e.target.value);setPage(1);}} type="number" placeholder={ph}
      style={{width:110,background:BG,border:`1px solid ${BD}`,borderRadius:6,padding:"7px 10px",fontSize:12,color:"#1C2B4B",fontFamily:"inherit",outline:"none"}}/>
  );

  return (
    <div style={{animation:"fi .4s ease"}}>
      {/* KPI strip */}
      <div className="kpi-grid" style={{marginBottom:18}}>
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",borderLeft:"4px solid #6366F1"}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Total résultats</div>
          <div style={{fontSize:22,fontWeight:800,color:"#1C2B4B",fontFamily:"Georgia,serif",lineHeight:1}}>{AWARDS.length}</div>
          <div style={{fontSize:10,color:MU,marginTop:4}}>PV + Suivi commission</div>
        </div>
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",borderLeft:`4px solid ${A}`}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Marchés attribués</div>
          <div style={{fontSize:22,fontWeight:800,color:"#16A34A",fontFamily:"Georgia,serif",lineHeight:1}}>{AWARDS_PV.length}</div>
          <div style={{fontSize:10,color:MU,marginTop:4}}>lauréats déclarés</div>
        </div>
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",borderLeft:"4px solid #D97706"}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Suivis commission</div>
          <div style={{fontSize:22,fontWeight:800,color:"#D97706",fontFamily:"Georgia,serif",lineHeight:1}}>{AWARDS_SUIVI.length}</div>
          <div style={{fontSize:10,color:MU,marginTop:4}}>résultats partiels</div>
        </div>
        <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",borderLeft:"4px solid #7C3AED"}}>
          <div style={{fontSize:9,color:MU,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:8}}>Montant total attribué</div>
          <div style={{fontSize:22,fontWeight:800,color:"#7C3AED",fontFamily:"Georgia,serif",lineHeight:1}}>{fmtMAD(TOTAL_AWARDED)}</div>
          <div style={{fontSize:10,color:MU,marginTop:4}}>lauréats avec montant</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,padding:"16px",marginBottom:14,display:"flex",flexDirection:"column",gap:12}}>
        {/* Row 1: search + sort */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 220px",display:"flex",alignItems:"center",gap:8,background:BG,border:`1px solid ${BD}`,borderRadius:7,padding:"8px 12px"}}>
            <IcSrch/>
            <input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Acheteur, objet, référence, entreprise…"
              style={{border:"none",background:"transparent",outline:"none",fontSize:13,color:"#1C2B4B",width:"100%",fontFamily:"inherit"}}/>
            {query&&<button onClick={()=>{setQuery("");setPage(1);}} style={{border:"none",background:"none",cursor:"pointer",color:MU,padding:0,display:"flex",alignItems:"center"}}><IcClose/></button>}
          </div>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:BG,border:`1px solid ${BD}`,borderRadius:7,padding:"8px 12px",fontSize:12,color:"#1C2B4B",fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            <option value="deadline">Tri : Date limite ↓</option>
            <option value="montant">Tri : Montant ↓</option>
            <option value="buyer">Tri : Acheteur A→Z</option>
          </select>
        </div>
        {/* Row 2: source chips */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:10,color:MU,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Source :</span>
          {[["EXTRAIT_PV","🏆 Extrait PV","#16A34A",AWARDS_PV.length],["SUIVI_COMMISSION","📋 Suivi Commission","#D97706",AWARDS_SUIVI.length]].map(([key,label,color,count])=>(
            <button key={key} onClick={()=>togSource(key)} style={{padding:"4px 11px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${selSources.includes(key)?color:BD}`,background:selSources.includes(key)?`${color}18`:W,color:selSources.includes(key)?color:MU,transition:"all .15s"}}>
              {label} <span style={{opacity:.6}}>({count})</span>
            </button>
          ))}
        </div>
        {/* Row 3: montant + ville */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",paddingTop:4,borderTop:`1px solid ${BD}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:MU,fontWeight:600,whiteSpace:"nowrap"}}>Montant (DH) :</span>
            {numInput(minMontant,setMinMontant,"Min")}
            <span style={{fontSize:11,color:MU}}>—</span>
            {numInput(maxMontant,setMaxMontant,"Max")}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:MU,fontWeight:600,whiteSpace:"nowrap"}}>Ville :</span>
            <input value={locFilter} onChange={e=>{setLocFilter(e.target.value);setPage(1);}} placeholder="ex. CASABLANCA"
              style={{width:140,background:BG,border:`1px solid ${BD}`,borderRadius:6,padding:"7px 10px",fontSize:12,color:"#1C2B4B",fontFamily:"inherit",outline:"none"}}/>
            {locFilter&&<button onClick={()=>{setLocFilter("");setPage(1);}} style={{border:"none",background:"none",cursor:"pointer",color:MU,padding:0,display:"flex",alignItems:"center"}}><IcClose/></button>}
          </div>
          {hasFilter&&<button onClick={reset} style={{marginLeft:"auto",border:"none",background:"none",color:A,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Réinitialiser tout</button>}
        </div>
      </div>

      {/* Count */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:13,fontWeight:700,color:"#1C2B4B"}}>
          {sorted.length} résultat{sorted.length>1?"s":""}{" "}
          <span style={{fontSize:11,fontWeight:400,color:MU}}>({pvCount} PV · {suiviCount} commission)</span>
        </span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {hasFilter&&<span style={{background:`${A}20`,color:A,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>Filtré</span>}
          {totalPages>1&&<span style={{fontSize:11,color:MU}}>Page {page}/{totalPages}</span>}
        </div>
      </div>

      {/* List */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {sorted.length===0
          ? <div style={{textAlign:"center",padding:50,color:MU,background:W,borderRadius:10,border:`1px solid ${BD}`}}>Aucun résultat ne correspond aux filtres.</div>
          : paginated.map(rec=><AwardCard key={rec.ref_consultation} rec={rec}/>)
        }
      </div>

      {/* Pagination */}
      {totalPages>1&&(
        <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
          <button onClick={()=>goPage(Math.max(1,page-1))} disabled={page===1}
            style={{width:34,height:34,border:`1px solid ${BD}`,borderRadius:7,background:page===1?BG:W,color:page===1?MU:"#1C2B4B",cursor:page===1?"default":"pointer",fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          {pageNums().map((n,i)=>
            n==="…"
              ?<span key={`e${i}`} style={{width:34,textAlign:"center",fontSize:13,color:MU}}>…</span>
              :<button key={n} onClick={()=>goPage(n)}
                  style={{width:34,height:34,border:`1.5px solid ${n===page?A:BD}`,borderRadius:7,background:n===page?A:W,color:n===page?W:"#1C2B4B",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
                  {n}
                </button>
          )}
          <button onClick={()=>goPage(Math.min(totalPages,page+1))} disabled={page===totalPages}
            style={{width:34,height:34,border:`1px solid ${BD}`,borderRadius:7,background:page===totalPages?BG:W,color:page===totalPages?MU:"#1C2B4B",cursor:page===totalPages?"default":"pointer",fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>
      )}
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [agency] = useState("D1");
  const [view,   setView]   = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = THEMES[agency];
  const allAtts = useMemo(()=>[
    ...ATTS_PR.map(a=>({...a,_ag:"PR Media"})),
    ...ATTS_D1.map(a=>({...a,_ag:"D1 Social"})),
  ],[]);
  const A = theme.accent;

  const goView = v=>{ setView(v); setMenuOpen(false); };

  return (
    <div style={{fontFamily:"'Segoe UI','Helvetica Neue',Arial,sans-serif",minHeight:"100vh",background:BG,color:"#1C2B4B"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${A}55;border-radius:3px}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}

        html,body{overflow-x:hidden;max-width:100%}

        /* MOBILE FIRST */
        .kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
        .aos-grid{display:grid;grid-template-columns:1fr;gap:12px}
        .chart-col{display:flex;flex-direction:column;gap:12px}
        .chart-row-1{display:flex;flex-direction:column;gap:12px}
        .chart-pair{display:flex;flex-direction:column;gap:12px}
        .search-layout{display:block;width:100%}
        .search-results{min-width:0;overflow:hidden;width:100%}
        .profiles-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .sidebar-desktop{display:none}
        .nav-desktop{display:none}
        .switcher-desktop{display:none}
        .burger-btn{display:flex!important}
        .stats-header{display:none}

        /* TABLETTE 640px+ */
        @media(min-width:640px){
          .kpi-grid{grid-template-columns:repeat(2,1fr);gap:12px}
          .chart-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}
          .chart-row-1{display:grid;grid-template-columns:1.5fr 1fr;gap:14px}
          .profiles-grid{grid-template-columns:repeat(2,1fr);gap:12px}
          .aos-grid{grid-template-columns:1fr 1fr;gap:14px}
        }

        /* DESKTOP 900px+ */
        @media(min-width:900px){
          .kpi-grid{grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
          .aos-grid{grid-template-columns:1fr 1fr;gap:16px}
          .chart-col{gap:20px}
          .chart-row-1{display:grid;grid-template-columns:1.6fr 1fr;gap:20px}
          .chart-pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}
          .search-layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:20px;align-items:start}
          .sidebar-desktop{display:block!important}
          .profiles-grid{grid-template-columns:repeat(3,1fr);gap:14px}
          .nav-desktop{display:flex!important}
          .switcher-desktop{display:flex!important}
          .burger-btn{display:none!important}
          .stats-header{display:block!important}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:W,borderBottom:`1px solid ${BD}`,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
        <div style={{height:3,background:A,transition:"background .3s"}}/>
        <div style={{padding:"0 16px",display:"flex",alignItems:"center",height:56,gap:12}}>

          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
            <img src={BizDevLogo} height={42} alt="BizDev by DPR Group" style={{objectFit:"contain",display:"block"}}/>
          </div>

          {/* Nav desktop */}
          <nav className="nav-desktop" style={{gap:2,marginLeft:16}}>
            {[["dashboard",<IcGrid/>,"Dashboard"],["search",<IcFind/>,"Attestations"],["profiles",<IcUsers/>,"CVthèque"],["aos",<IcDoc/>,"Appels d'Offres"],["awards",<IcTrophy/>,"Extrait de PV"]].map(([v,ic,l])=>(
              <button key={v} onClick={()=>goView(v)} style={{background:view===v?`${A}18`:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,padding:"7px 12px",borderRadius:6,color:view===v?(theme.key==="D1"?"#8B6800":A):MU,display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
                {ic} {l}
              </button>
            ))}
          </nav>

          {/* Stats desktop */}
          <div className="switcher-desktop" style={{marginLeft:"auto",alignItems:"center",gap:10}}>
            <div className="stats-header" style={{textAlign:"right"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#1C2B4B"}}>{allAtts.length} attestations</div>
              <div style={{fontSize:10,color:MU}}>{[...new Set(allAtts.map(a=>a.ann))].length} annonceurs</div>
            </div>
          </div>

          {/* Burger mobile */}
          <button className="burger-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{
            marginLeft:"auto",border:"none",cursor:"pointer",
            color:"#1C2B4B",display:"flex",alignItems:"center",justifyContent:"center",
            width:36,height:36,borderRadius:8,
            background:menuOpen?LT:"none",
          }}>
            {menuOpen?<IcClose/>:<IcBurger/>}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen&&(
          <div style={{background:W,borderTop:`1px solid ${BD}`,padding:"12px 16px",animation:"slideDown .2s ease",display:"flex",flexDirection:"column",gap:6}}>
            {/* Nav */}
            {[["dashboard",<IcGrid/>,"Dashboard"],["search",<IcFind/>,"Attestations"],["profiles",<IcUsers/>,"CVthèque"],["aos",<IcDoc/>,"Appels d'Offres"],["awards",<IcTrophy/>,"Extrait de PV"]].map(([v,ic,l])=>(
              <button key={v} onClick={()=>goView(v)} style={{background:view===v?`${A}12`:BG,border:`1px solid ${view===v?A:BD}`,borderRadius:8,padding:"11px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:view===v?(theme.key==="D1"?"#8B6800":A):"#1C2B4B",display:"flex",alignItems:"center",gap:10,transition:"all .15s",textAlign:"left"}}>
                {ic} {l}
              </button>
            ))}
            {/* Stats */}
            <div style={{display:"flex",gap:10,paddingTop:4}}>
              <div style={{flex:1,background:BG,borderRadius:8,padding:"10px 12px",border:`1px solid ${BD}`}}>
                <div style={{fontSize:10,color:MU,textTransform:"uppercase",fontWeight:700}}>Attestations</div>
                <div style={{fontSize:18,fontWeight:800,color:"#1C2B4B"}}>{allAtts.length}</div>
              </div>
              <div style={{flex:1,background:BG,borderRadius:8,padding:"10px 12px",border:`1px solid ${BD}`}}>
                <div style={{fontSize:10,color:MU,textTransform:"uppercase",fontWeight:700}}>Annonceurs</div>
                <div style={{fontSize:18,fontWeight:800,color:"#1C2B4B"}}>{[...new Set(allAtts.map(a=>a.ann))].length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENU ── */}
      <div style={{maxWidth:1120,margin:"0 auto",padding:"18px 14px 40px"}}>
        {view==="dashboard"&&<Dashboard atts={allAtts} theme={theme}/>}
        {view==="search"   &&<Search    atts={allAtts} theme={theme}/>}
        {view==="profiles" &&<Profiles  theme={theme}/>}
        {view==="aos"      &&<AOsPage/>}
        {view==="awards"   &&<AwardsPage/>}
      </div>
    </div>
  );
}
