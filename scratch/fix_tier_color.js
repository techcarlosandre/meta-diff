const fs = require('fs');
const path = 'c:\\Users\\Carlos\\Desktop\\meta_diff\\src\\app\\champion\\[name]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update the rendering loop for stats
const statsLoopTarget = '<div key={i} className={`group relative glass-card scanline-effect p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all hover:-translate-y-3 cursor-default overflow-hidden ${s.special ? getTierColor(s.val) : \'\'}`}>';
const statsLoopReplacement = '<div key={i} className={`group relative ${s.special ? getTierColor(s.val) : \'glass-card\'} scanline-effect p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all hover:-translate-y-3 cursor-default overflow-hidden`}>';

content = content.replace(statsLoopTarget, statsLoopReplacement);

// Ensure getTierColor has the right colors
content = content.replace("case 'S': return 'bg-secondary text-void';", "case 'S': return 'bg-secondary text-void shadow-[0_0_50px_rgba(255,184,0,0.2)]';");
content = content.replace("case 'A': return 'bg-emerald-500 text-void';", "case 'A': return 'bg-emerald-500 text-void shadow-[0_0_50px_rgba(16,185,129,0.2)]';");

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated file');
