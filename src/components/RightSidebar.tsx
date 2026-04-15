import { Link } from 'react-router-dom';

export default function RightSidebar() {
  return (
    <aside className="w-[220px] hidden xl:block p-6 bg-bg-dark/50 border-l border-border-color h-[calc(100vh-70px)] sticky top-[70px] overflow-y-auto">
      <div className="h-[180px] bg-card-bg border border-dashed border-text-dim rounded-xl flex items-center justify-center text-text-dim text-[11px] uppercase mb-8 text-center px-4">
        Header Advertisement<br/>970x250 Style
      </div>

      <h4 className="text-[12px] uppercase text-text-dim mb-5 tracking-wider font-semibold">Trending Leaderboard</h4>
      
      <div className="space-y-5">
        {[
          { rank: '01', title: 'Shadow Realm', stats: '+15% Growth' },
          { rank: '02', title: 'Aero Combat', stats: '+8.2k Today' },
          { rank: '03', title: 'Bubble Burst', stats: '+4k Today' },
        ].map((item) => (
          <div key={item.rank} className="flex gap-3 items-center">
            <div className="text-2xl font-extrabold text-text-dim opacity-30 w-[30px]">{item.rank}</div>
            <div>
              <div className="text-[13px] font-semibold text-text-main">{item.title}</div>
              <div className="text-[11px] text-primary-color">{item.stats}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[120px] bg-card-bg border border-dashed border-text-dim rounded-xl flex items-center justify-center text-text-dim text-[11px] uppercase mt-10">
        Sidebar Ads
      </div>
    </aside>
  );
}
