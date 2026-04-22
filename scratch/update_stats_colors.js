const fs = require('fs');
const path = 'c:\\Users\\Carlos\\Desktop\\meta_diff\\src\\app\\champion\\[name]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add getStatColor helper
const getStatColorFunction = `
   const getStatColor = (val: any, type: 'win' | 'pick' | 'ban') => {
      if (val === undefined || val === null) return 'text-white/20';
      const num = typeof val === 'string' ? parseFloat(val.replace(',', '.').replace('%', '')) : val;
      if (isNaN(num)) return 'text-white/20';
      
      if (type === 'win') {
         if (num >= 52) return 'text-emerald-400 text-glow-emerald';
         if (num >= 50) return 'text-primary';
         if (num >= 48) return 'text-amber-400';
         return 'text-red-400';
      }
      if (type === 'ban') {
         if (num >= 25) return 'text-red-500';
         if (num >= 15) return 'text-amber-500';
         if (num >= 5) return 'text-white';
         return 'text-white/40';
      }
      return 'text-white';
   };
`;

if (!content.includes('const getStatColor =')) {
    content = content.replace('const formatRate = (val: any) => {', getStatColorFunction + '\n   const formatRate = (val: any) => {');
}

// Fix the stats array to use dynamic colors
const statsArrayOld = `                  [
                     { label: 'Probabilidade de Vitória', val: buildData?.winRate, color: 'text-primary', icon: TrendingUp },
                     { label: 'Frequência de Escolha', val: buildData?.pickRate, color: 'text-white', icon: Activity },
                     { label: 'Contenção de Ameaças', val: buildData?.banRate, color: 'text-red-500', icon: Target },
                     { label: 'Tier Operacional', val: buildData?.tier || 'A', color: 'text-void', special: true }
                  ]`;

const statsArrayNew = `                  [
                     { label: 'Probabilidade de Vitória', val: buildData?.winRate, color: getStatColor(buildData?.winRate, 'win'), icon: TrendingUp },
                     { label: 'Frequência de Escolha', val: buildData?.pickRate, color: 'text-white', icon: Activity },
                     { label: 'Contenção de Ameaças', val: buildData?.banRate, color: getStatColor(buildData?.banRate, 'ban'), icon: Target },
                     { label: 'Tier Operacional', val: buildData?.tier || 'A', color: 'text-void', special: true }
                  ]`;

content = content.replace(statsArrayOld, statsArrayNew);

// Fix the skeleton condition
content = content.replace('{buildLoading || !s.val ?', '{buildLoading || (s.val === undefined || s.val === null) ?');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated file');
