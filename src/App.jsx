import { useState, useEffect, useRef } from "react";

const genId = () => `note_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const STORAGE_KEY = "notesapp_v3";
const loadNotes = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
const saveNotes = (n) => localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
const formatDate = (ts) => new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

const NEON_COLORS = [
  { glow:"#a78bfa", border:"border-violet-500/40", text:"text-violet-300", bg:"bg-violet-500/10", dot:"bg-violet-400", badge:"bg-violet-500/20 text-violet-300" },
  { glow:"#f472b6", border:"border-pink-500/40",   text:"text-pink-300",   bg:"bg-pink-500/10",   dot:"bg-pink-400",   badge:"bg-pink-500/20 text-pink-300"   },
  { glow:"#34d399", border:"border-emerald-500/40",text:"text-emerald-300",bg:"bg-emerald-500/10",dot:"bg-emerald-400",badge:"bg-emerald-500/20 text-emerald-300"},
  { glow:"#60a5fa", border:"border-blue-500/40",   text:"text-blue-300",   bg:"bg-blue-500/10",   dot:"bg-blue-400",   badge:"bg-blue-500/20 text-blue-300"   },
  { glow:"#fb923c", border:"border-orange-500/40", text:"text-orange-300", bg:"bg-orange-500/10", dot:"bg-orange-400", badge:"bg-orange-500/20 text-orange-300"},
  { glow:"#facc15", border:"border-yellow-500/40", text:"text-yellow-300", bg:"bg-yellow-500/10", dot:"bg-yellow-400", badge:"bg-yellow-500/20 text-yellow-300"},
  { glow:"#2dd4bf", border:"border-teal-500/40",   text:"text-teal-300",   bg:"bg-teal-500/10",   dot:"bg-teal-400",   badge:"bg-teal-500/20 text-teal-300"   },
  { glow:"#e879f9", border:"border-fuchsia-500/40",text:"text-fuchsia-300",bg:"bg-fuchsia-500/10",dot:"bg-fuchsia-400",badge:"bg-fuchsia-500/20 text-fuchsia-300"},
];

const noteColorMap = {};
const getNoteColor = (id) => {
  if(!noteColorMap[id]) noteColorMap[id] = NEON_COLORS[Object.keys(noteColorMap).length % NEON_COLORS.length];
  return noteColorMap[id];
};

const TAG_COLORS_LIST = [
  "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  "bg-pink-500/20 text-pink-300 border border-pink-500/30",
  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  "bg-teal-500/20 text-teal-300 border border-teal-500/30",
];
const tagClrMap = {};
const getTagClr = (t) => { if(!tagClrMap[t]) tagClrMap[t]=TAG_COLORS_LIST[Object.keys(tagClrMap).length%TAG_COLORS_LIST.length]; return tagClrMap[t]; };

// Icons
const I = ({d,s=16,c=""}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c}>{[].concat(d).map((p,i)=><path key={i} d={p}/>)}</svg>;
const CircleI = ({cx,cy,r,s=16,c=""}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={c}><circle cx={cx} cy={cy} r={r}/></svg>;

const SearchIcon = ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const PlusIcon = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const XIcon = ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const EditIcon = ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const ArchiveIcon = ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>;
const RestoreIcon = ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;
const PinIcon = ({on})=><svg width="13" height="13" viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>;
const MenuIcon = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const TagIcon = ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>;

// Confirm Dialog
const ConfirmDialog = ({message,onConfirm,onCancel}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
    <div className="bg-[#0f0f1a] border border-red-500/30 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full"
      style={{boxShadow:"0 0 40px rgba(239,68,68,0.15)"}}>
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
        <TrashIcon/>
      </div>
      <p className="text-white font-bold text-center mb-1" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Delete forever?</p>
      <p className="text-gray-400 text-sm text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 font-semibold text-sm hover:bg-white/5 transition-all">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-all">Delete</button>
      </div>
    </div>
  </div>
);

// Note Modal
const NoteModal = ({mode,note,onSave,onClose}) => {
  const [title,setTitle] = useState(note?.title||"");
  const [content,setContent] = useState(note?.content||"");
  const [tagInput,setTagInput] = useState("");
  const [tags,setTags] = useState(note?.tags||[]);
  const [editing,setEditing] = useState(mode!=="view");
  const titleRef = useRef();
  const clr = note ? getNoteColor(note.id) : NEON_COLORS[0];

  useEffect(()=>{if(editing&&titleRef.current)titleRef.current.focus();},[editing]);

  const addTag = e => {
    if((e.key==="Enter"||e.key===",")&&tagInput.trim()){
      e.preventDefault();
      const t=tagInput.trim().toLowerCase().replace(/,/g,"");
      if(t&&!tags.includes(t)) setTags([...tags,t]);
      setTagInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`bg-[#0d0d1a] border ${clr.border} rounded-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col`}
        style={{boxShadow:`0 0 60px ${clr.glow}22, 0 25px 50px rgba(0,0,0,0.5)`,animation:"modalIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
        {/* Header */}
        <div className={`p-5 border-b ${clr.border} ${clr.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${clr.dot} animate-pulse`}/>
              <span className={`text-xs font-bold uppercase tracking-widest ${clr.text}`}>
                {mode==="create"?"New Note":editing?"Editing":"Reading"}
              </span>
            </div>
            <div className="flex gap-2">
              {mode==="view"&&!editing&&(
                <button onClick={()=>setEditing(true)} className={`w-8 h-8 rounded-xl ${clr.bg} border ${clr.border} ${clr.text} flex items-center justify-center hover:opacity-80 transition-all`}><EditIcon/></button>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center hover:bg-white/10 transition-all"><XIcon/></button>
            </div>
          </div>
          {editing
            ? <input ref={titleRef} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Note title..." className={`w-full bg-transparent text-2xl font-black ${clr.text} placeholder-gray-600 outline-none`} style={{fontFamily:"'Space Grotesk',sans-serif"}}/>
            : <h2 className={`text-2xl font-black ${clr.text}`} style={{fontFamily:"'Space Grotesk',sans-serif"}}>{note?.title}</h2>
          }
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {editing ? (
            <>
              <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Start writing your thoughts..." rows={8}
                className="w-full bg-transparent text-gray-300 placeholder-gray-600 outline-none resize-none text-sm leading-relaxed"/>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map(t=>(
                    <span key={t} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getTagClr(t)}`}>
                      #{t}<button onClick={()=>setTags(tags.filter(x=>x!==t))} className="hover:opacity-60"><XIcon/></button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
                  <TagIcon/><span className="text-gray-600 text-xs">#</span>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={addTag} placeholder="tag name, press Enter"
                    className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none flex-1"/>
                </div>
              </div>
            </>
          ) : (
            <>
              {note?.content
                ? <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                : <p className="text-gray-600 text-sm italic text-center py-8">Nothing written yet.</p>
              }
              {note?.tags?.length>0&&(
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                  {note.tags.map(t=><span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getTagClr(t)}`}>#{t}</span>)}
                </div>
              )}
              <p className={`text-xs mt-4 ${clr.text} opacity-50`}>{formatDate(note?.updatedAt)}</p>
            </>
          )}
        </div>
        {editing&&(
          <div className="p-4 border-t border-white/5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-500 text-sm font-semibold hover:bg-white/5 transition-all">Cancel</button>
            <button onClick={()=>{if(title.trim())onSave({title:title.trim(),content:content.trim(),tags})}} disabled={!title.trim()}
              className={`flex-1 py-2.5 rounded-xl ${clr.bg} border ${clr.border} ${clr.text} text-sm font-bold disabled:opacity-30 transition-all hover:opacity-80`}
              style={{boxShadow:`0 0 20px ${clr.glow}22`}}>
              Save Note →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Note Card
const NoteCard = ({note,view,onPin,onView,onEdit,onArchive,onTrash,onRestore,onDeletePermanent}) => {
  const c = getNoteColor(note.id);
  return (
    <div className={`relative group bg-[#0d0d1a] border ${c.border} rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col gap-2`}
      style={{boxShadow:`0 0 0 0 ${c.glow}00`}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 30px ${c.glow}20`;}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 0 0 0 ${c.glow}00`;}}
      onClick={()=>view!=="trash"&&onView(note)}>

      {note.pinned&&(
        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg ${c.bg} border ${c.border} ${c.text} flex items-center justify-center`}>
          <PinIcon on={true}/>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 mt-1.5 rounded-full ${c.dot} flex-shrink-0`}/>
        <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${c.text} flex-1`} style={{fontFamily:"'Space Grotesk',sans-serif"}}>{note.title}</h3>
      </div>

      {note.content&&<p className="text-gray-500 text-xs leading-relaxed line-clamp-3 pl-4">{note.content}</p>}

      {note.tags?.length>0&&(
        <div className="flex flex-wrap gap-1 pl-4">
          {note.tags.slice(0,3).map(t=><span key={t} className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getTagClr(t)}`}>#{t}</span>)}
          {note.tags.length>3&&<span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-gray-500">+{note.tags.length-3}</span>}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 mt-auto border-t border-white/5">
        <span className="text-[10px] text-gray-600 pl-4">{formatDate(note.updatedAt)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>e.stopPropagation()}>
          {view==="notes"&&<>
            <button onClick={()=>onPin(note.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${note.pinned?`${c.bg} ${c.text} border ${c.border}`:"text-gray-600 hover:text-gray-400 hover:bg-white/5"}`}><PinIcon on={note.pinned}/></button>
            <button onClick={()=>onEdit(note)} className="w-6 h-6 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 flex items-center justify-center transition-all"><EditIcon/></button>
            <button onClick={()=>onArchive(note.id)} className="w-6 h-6 rounded-lg text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10 flex items-center justify-center transition-all"><ArchiveIcon/></button>
            <button onClick={()=>onTrash(note.id)} className="w-6 h-6 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"><TrashIcon/></button>
          </>}
          {view==="archived"&&<>
            <button onClick={()=>onRestore(note.id)} className="w-6 h-6 rounded-lg text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center transition-all"><RestoreIcon/></button>
            <button onClick={()=>onTrash(note.id)} className="w-6 h-6 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"><TrashIcon/></button>
          </>}
          {view==="trash"&&<>
            <button onClick={()=>onRestore(note.id)} className="w-6 h-6 rounded-lg text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center transition-all"><RestoreIcon/></button>
            <button onClick={()=>onDeletePermanent(note.id)} className="w-6 h-6 rounded-lg text-red-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"><TrashIcon/></button>
          </>}
        </div>
      </div>
    </div>
  );
};

// App
export default function App() {
  const [notes,setNotes] = useState(loadNotes);
  const [view,setView] = useState("notes");
  const [search,setSearch] = useState("");
  const [selTag,setSelTag] = useState(null);
  const [modal,setModal] = useState(null);
  const [confirm,setConfirm] = useState(null);
  const [sidebar,setSidebar] = useState(false);

  useEffect(()=>saveNotes(notes),[notes]);

  const allTags = [...new Set(notes.filter(n=>n.status==="notes").flatMap(n=>n.tags||[]))];
  const counts = {notes:notes.filter(n=>n.status==="notes").length,archived:notes.filter(n=>n.status==="archived").length,trash:notes.filter(n=>n.status==="trash").length};

  const filtered = notes.filter(n=>{
    if(n.status!==view) return false;
    const q=search.toLowerCase();
    return (!q||n.title.toLowerCase().includes(q)||n.content?.toLowerCase().includes(q))
      &&(!selTag||(n.tags||[]).includes(selTag));
  }).sort((a,b)=>{
    if(view==="notes"){if(a.pinned&&!b.pinned)return -1;if(!a.pinned&&b.pinned)return 1;}
    return b.updatedAt-a.updatedAt;
  });

  const createNote = d=>{const now=Date.now();setNotes(p=>[...p,{id:genId(),...d,pinned:false,status:"notes",createdAt:now,updatedAt:now}]);setModal(null);};
  const editNote = (id,d)=>{setNotes(p=>p.map(n=>n.id===id?{...n,...d,updatedAt:Date.now()}:n));setModal(null);};
  const togglePin = id=>setNotes(p=>p.map(n=>n.id===id?{...n,pinned:!n.pinned}:n));
  const archiveNote = id=>setNotes(p=>p.map(n=>n.id===id?{...n,status:"archived",pinned:false}:n));
  const trashNote = id=>setNotes(p=>p.map(n=>n.id===id?{...n,status:"trash",pinned:false}:n));
  const restoreNote = id=>setNotes(p=>p.map(n=>n.id===id?{...n,status:"notes"}:n));
  const deletePermanent = id=>setConfirm({message:"This action cannot be undone.",onConfirm:()=>{setNotes(p=>p.filter(n=>n.id!==id));setConfirm(null);}});
  const emptyTrash = ()=>setConfirm({message:`Permanently delete all ${counts.trash} notes?`,onConfirm:()=>{setNotes(p=>p.filter(n=>n.status!=="trash"));setConfirm(null);}});

  const navItems = [
    {id:"notes",label:"Notes",icon:"◈",clr:"text-violet-400",activeBg:"bg-violet-500/10 border-violet-500/30"},
    {id:"archived",label:"Archive",icon:"◫",clr:"text-yellow-400",activeBg:"bg-yellow-500/10 border-yellow-500/30"},
    {id:"trash",label:"Trash",icon:"◻",clr:"text-red-400",activeBg:"bg-red-500/10 border-red-500/30"},
  ];

  return (
    <div className="min-h-screen bg-[#060610] flex text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *{font-family:'Space Grotesk',sans-serif}
        @keyframes modalIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
        .card-in{animation:cardIn .35s ease forwards;opacity:0}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e1e3a;border-radius:99px}
        .animate-pulse{animation:pulse-dot 2s ease infinite}
      `}</style>

      {/* BG grid */}
      <div className="fixed inset-0 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(139,92,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

      {/* Glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"/>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl pointer-events-none"/>

      {sidebar&&<div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={()=>setSidebar(false)}/>}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-30 h-screen w-64 bg-[#080812] border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebar?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
              <span className="text-violet-400 font-black text-lg" style={{fontFamily:"'Space Grotesk',sans-serif"}}>N</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">NeuralNotes</p>
              <p className="text-[10px] text-gray-600">Think deeper</p>
            </div>
          </div>
        </div>

        {/* New Note */}
        <div className="p-4">
          <button onClick={()=>{setModal({mode:"create"});setSidebar(false)}}
            className="w-full flex items-center justify-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold py-3 rounded-xl text-sm hover:bg-violet-500/20 transition-all"
            style={{boxShadow:"0 0 20px rgba(139,92,246,0.1)"}}>
            <PlusIcon/> New Note
          </button>
        </div>

        {/* Stats */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-1.5">
          {navItems.map(({id,clr})=>(
            <div key={id} className="bg-white/3 border border-white/5 rounded-xl p-2 text-center">
              <p className={`font-black text-base ${clr}`}>{counts[id]}</p>
              <p className="text-[9px] text-gray-600 capitalize">{id}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({id,label,icon,clr,activeBg})=>(
            <button key={id} onClick={()=>{setView(id);setSelTag(null);setSearch("");setSidebar(false)}}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${view===id?`${activeBg} ${clr}`:"border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/3"}`}>
              <span className={`text-base ${view===id?clr:"text-gray-600"}`}>{icon}</span>
              {label}
              {counts[id]>0&&<span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${view===id?"bg-white/10":"bg-white/5 text-gray-600"}`}>{counts[id]}</span>}
            </button>
          ))}

          {allTags.length>0&&(
            <div className="pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700 px-3 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {allTags.map(t=>(
                  <button key={t} onClick={()=>{setView("notes");setSelTag(selTag===t?null:t);setSidebar(false)}}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${selTag===t?getTagClr(t):"bg-white/5 text-gray-500 hover:bg-white/10"}`}>
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            <p className="text-xs text-gray-600">{notes.filter(n=>n.status==="notes").length} notes • auto-saved</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-[#060610]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-20">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-500" onClick={()=>setSidebar(true)}><MenuIcon/></button>

          <div className="flex-1 flex items-center bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 gap-2.5 max-w-md focus-within:border-violet-500/30 transition-colors">
            <span className="text-gray-600"><SearchIcon/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes..."
              className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none"/>
            {search&&<button onClick={()=>setSearch("")} className="text-gray-600 hover:text-gray-400"><XIcon/></button>}
          </div>

          <button onClick={()=>setModal({mode:"create"})}
            className="hidden lg:flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-violet-500/20 transition-all">
            <PlusIcon/> New Note
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
                {view==="notes"?"◈ Notes":view==="archived"?"◫ Archive":"◻ Trash"}
              </h2>
              {selTag&&(
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">tag:</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getTagClr(selTag)}`}>#{selTag}</span>
                  <button onClick={()=>setSelTag(null)} className="text-gray-600 hover:text-gray-400"><XIcon/></button>
                </div>
              )}
            </div>
            {view==="trash"&&counts.trash>0&&(
              <button onClick={emptyTrash} className="text-xs text-red-500 border border-red-500/30 hover:bg-red-500/10 font-semibold px-3 py-1.5 rounded-lg transition-all">
                Empty Trash
              </button>
            )}
          </div>

          {filtered.length===0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-4 text-2xl text-gray-700">
                {view==="notes"?"◈":view==="archived"?"◫":"◻"}
              </div>
              <p className="text-white font-bold mb-1">{search||selTag?"Nothing found":{notes:"No notes yet",archived:"Archive is empty",trash:"Trash is clean"}[view]}</p>
              <p className="text-gray-600 text-sm mb-5">{!search&&!selTag&&view==="notes"?"Start capturing your thoughts →":""}</p>
              {!search&&!selTag&&view==="notes"&&(
                <button onClick={()=>setModal({mode:"create"})}
                  className="px-5 py-2.5 bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-xl text-sm font-bold hover:bg-violet-500/20 transition-all">
                  + Create Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((note,i)=>(
                <div key={note.id} className="card-in" style={{animationDelay:`${i*35}ms`}}>
                  <NoteCard note={note} view={view}
                    onPin={togglePin} onView={n=>setModal({mode:"view",note:n})}
                    onEdit={n=>setModal({mode:"edit",note:n})}
                    onArchive={archiveNote} onTrash={trashNote}
                    onRestore={restoreNote} onDeletePermanent={deletePermanent}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <button onClick={()=>setModal({mode:"create"})}
          className="fixed bottom-6 right-6 lg:hidden w-12 h-12 bg-violet-500/20 border border-violet-500/40 text-violet-300 rounded-xl flex items-center justify-center hover:bg-violet-500/30 transition-all z-20"
          style={{boxShadow:"0 0 30px rgba(139,92,246,0.2)"}}>
          <PlusIcon/>
        </button>
      </main>

      {modal&&<NoteModal mode={modal.mode} note={modal.note} onClose={()=>setModal(null)}
        onSave={d=>modal.mode==="create"?createNote(d):editNote(modal.note.id,d)}/>}
      {confirm&&<ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}