const fs = require('fs');
const path = 'c:\\Users\\Carlos\\Desktop\\meta_diff\\src\\app\\champion\\[name]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add useRouter to imports
if (!content.includes('useRouter')) {
    content = content.replace("import { useParams } from 'next/navigation';", "import { useParams, useRouter } from 'next/navigation';");
}

// Add state for showMainList
if (!content.includes('const [showMainList, setShowMainList]')) {
    content = content.replace("const [showLaneList, setShowLaneList] = useState(false);", "const [showLaneList, setShowLaneList] = useState(false);\n   const [showMainList, setShowMainList] = useState(false);");
}

// Add router initialization
if (!content.includes('const router = useRouter();')) {
    content = content.replace("const params = useParams();", "const params = useParams();\n   const router = useRouter();");
}

// Modify Main portrait to be clickable and show list
const mainPortraitTarget = `<div className="relative group/portrait cursor-pointer">`;
const mainPortraitReplacement = `<div className="relative group/portrait cursor-pointer" onClick={() => setShowMainList(!showMainList)}>`;
content = content.replace(mainPortraitTarget, mainPortraitReplacement);

// Add the search list for Main
// I'll look for where showMatchupList is rendered and add a similar one for showMainList before it.
const mainSearchList = `
                           {showMainList && (
                              <div className="absolute top-[130%] left-[-50%] w-[350px] glass-card rounded-[2rem] p-6 z-[999] shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500 border-t-primary/30 h-max">
                                 <div className="flex items-center gap-3 mb-6 bg-white/5 rounded-xl p-4 border border-white/5 focus-within:border-primary focus-within:bg-white/10 transition-all">
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    <input
                                       type="text"
                                       placeholder="TROCAR CAMPEÃO..."
                                       value={searchTerm}
                                       onChange={e => setSearchTerm(e.target.value)}
                                       className="bg-transparent border-none w-full text-xs text-white outline-none placeholder:text-white/10 font-bold uppercase tracking-widest"
                                    />
                                 </div>
                                 <div className="grid grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {allChamps.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                       <div key={c.id} onClick={() => { router.push(\`/champion/\${c.id}\`); setShowMainList(false); }} className="relative group/box cursor-pointer aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-primary transition-all duration-500">
                                          <img src={\`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/\${c.image.full}\`} className="w-full h-full object-cover grayscale group-hover/box:grayscale-0 transition-all scale-110 group-hover/box:scale-100" />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
`;

content = content.replace('{showMatchupList && (', mainSearchList + '\n                           {showMatchupList && (');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated file');
