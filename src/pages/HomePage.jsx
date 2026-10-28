import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout.jsx';
import { LoadingSpinner, EmptyState } from '../components/common/index.jsx';
import { MatchCard } from '../components/match/index.jsx';
import { Plus, Radio, CalendarDays, CheckCircle2, ArrowUpRight, Trophy } from 'lucide-react';
import { matchApi } from '../api/matchApi.js';

export function HomePage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    let alive = true;
    const fetchMatches = async () => {
      try {
        const data = await matchApi.getMatches();
        if (alive) setMatches(data);
      } catch (err) {
        if (alive && !matches.length) toast.error('Failed to load matches');
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => ['UPCOMING','CREATED','SETUP','INNINGS_BREAK','TIED'].includes(m.status));
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const getTabMatches = () => activeTab === 'live' ? liveMatches : activeTab === 'upcoming' ? upcomingMatches : completedMatches;
  const tabs = [
    { id:'live', label:'Live', count:liveMatches.length, icon:Radio },
    { id:'upcoming', label:'Upcoming', count:upcomingMatches.length, icon:CalendarDays },
    { id:'completed', label:'Completed', count:completedMatches.length, icon:CheckCircle2 },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-lime-300/10 px-5 py-8 sm:mb-10 sm:px-10 sm:py-12" style={{background:'radial-gradient(ellipse at 85% 20%,rgba(163,230,53,.13),transparent 35%),linear-gradient(120deg,#14251a,#0e1912 72%)'}}>
          <div className="pointer-events-none absolute -right-12 -top-10 hidden h-64 w-64 rounded-full border border-lime-300/10 sm:block"/><div className="pointer-events-none absolute -right-5 -top-3 hidden h-48 w-48 rounded-full border border-lime-300/10 sm:block"/>
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-lime-200"><Trophy size={14}/> Your game. Your scoreboard.</div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">Every run.<br className="sm:hidden"/> Every moment.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">Create a match, keep the score moving, and share live updates with everyone on the ground.</p>
            <button onClick={() => navigate('/create')} className="btn btn-primary mt-6 min-h-12 px-5 text-base"><Plus size={19}/> Create a match <ArrowUpRight size={17}/></button>
          </div>
          <div className="relative mt-8 grid grid-cols-3 gap-2 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:w-[17rem] sm:gap-3">
            {[
              {label:'Live now',count:liveMatches.length,icon:Radio},
              {label:'Upcoming',count:upcomingMatches.length,icon:CalendarDays},
              {label:'Completed',count:completedMatches.length,icon:CheckCircle2},
            ].map(({label,count,icon:Icon}) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4"><Icon size={16} className="mb-2 text-lime-300"/><p className="text-xl font-black tabular-nums sm:text-2xl">{count}</p><p className="mt-1 text-[10px] font-semibold text-slate-400 sm:text-xs">{label}</p></div>)}
          </div>
        </section>
        <section>
          <div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Match centre</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Your matches</h2></div><span className="pb-1 text-xs text-slate-500">Refreshes automatically</span></div>
          <div className="mb-5 flex gap-2 overflow-x-auto border-b border-white/10 pb-2" role="tablist" aria-label="Match status">
            {tabs.map(({id,label,count,icon:Icon}) => <button key={id} role="tab" aria-selected={activeTab===id} onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab===id?'bg-lime-300/10 text-lime-200 ring-1 ring-lime-300/20':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={16}/>{label}<span className="rounded-full bg-black/20 px-2 py-0.5 text-xs tabular-nums">{count}</span></button>)}
          </div>
          {loading ? <LoadingSpinner/> : getTabMatches().length===0 ? <div className="card py-10 text-center sm:py-14"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-200"><Trophy size={25}/></div><EmptyState title={`No ${activeTab} matches yet`} description={activeTab==='live'?'Start a match and the live scoreboard will appear here.':activeTab==='upcoming'?'Your created matches will show here before scoring starts.':'Completed match scorecards will be saved here.'}/><button onClick={() => navigate('/create')} className="btn btn-primary mt-5"><Plus size={17}/> Create a match</button></div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{getTabMatches().map(match=><MatchCard key={match._id} match={match}/>)}</div>}
        </section>
      </div>
    </Layout>
  );
}
