const fs = require('fs');
const path = 'c:\\Users\\Carlos\\Desktop\\meta_diff\\src\\app\\champion\\[name]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');
const target = 'grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar\">';
const replacement = target + `
                                     <div onClick={() => { setOpponent(null); setShowMatchupList(false); }} className="relative group/box cursor-pointer aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-red-500 flex flex-col items-center justify-center bg-white/5 transition-all duration-500">
                                        <X className="text-red-500/40 group-hover/box:text-red-500 w-6 h-6 transition-colors" />
                                        <span className="text-[7px] font-black text-white/20 mt-1 uppercase">Remover</span>
                                     </div>`;
const newContent = content.replace(target, replacement);
fs.writeFileSync(path, newContent, 'utf8');
console.log('Successfully updated file');
