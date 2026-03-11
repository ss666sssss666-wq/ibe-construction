const fs = require('fs');

let html = fs.readFileSync('./portal/admin.html', 'utf8');

// 1. Inject Tailwind and Chart.js in <head>
if (!html.includes('cdn.tailwindcss.com')) {
    html = html.replace('</head>', `
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        flup: {
                            bg: '#F4F7F6',
                            green: '#10B981',
                            greenLight: '#D1FAE5',
                            dark: '#1F2937',
                            gray: '#6B7280',
                            border: '#E5E7EB'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>`);
}

// 2. Adjust global body background to match prompt 1 (only if we can find body { background: ... })
html = html.replace(/body\s*\{[^}]*background:\s*var\(--bg\);/i, 'body { font-family: "Inter", sans-serif; background: #F4F7F6; min-height: 100vh; color: #1F2937; display: flex;');

// 3. We will replace the entire <aside class="sidebar">...</aside>
const sidebarRegex = /<aside class="sidebar">[\s\S]*?<\/aside>/;

const newSidebar = `
    <!-- NEW FLUP SIDEBAR -->
    <aside class="w-64 bg-white border-r border-flup-border h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300" id="flupSidebar">
        <!-- Logo Area -->
        <div class="h-20 flex items-center justify-between px-6 border-b border-flup-border">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-flup-green flex items-center justify-center text-white font-bold">IBE</div>
                <span class="font-bold text-flup-dark text-lg tracking-tight" id="sidebarLogoText">Admin</span>
            </div>
            <button onclick="document.getElementById('flupSidebar').classList.toggle('w-20'); document.getElementById('sidebarLogoText').classList.toggle('hidden'); document.querySelectorAll('.nav-label').forEach(el => el.classList.toggle('hidden')); document.querySelector('.main').classList.toggle('ml-20'); document.querySelector('.main').classList.toggle('ml-64');" class="text-flup-gray hover:text-flup-dark">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            
            <div class="text-xs font-semibold text-flup-gray uppercase tracking-wider mb-2 mt-4 px-2 nav-label">Tableau de bord</div>
            <button onclick="showSection('overview'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-green bg-flup-greenLight font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span class="nav-label text-sm">Vue d'ensemble</span>
            </button>

            <div class="text-xs font-semibold text-flup-gray uppercase tracking-wider mb-2 mt-6 px-2 nav-label">Gestion & Chantier</div>
            <button onclick="showSection('clients'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span class="nav-label text-sm">Clients</span>
            </button>
            <button onclick="showSection('projects'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <span class="nav-label text-sm">Projets (Chantiers)</span>
            </button>
            <button onclick="showSection('planning'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                <span class="nav-label text-sm">Planning Global</span>
            </button>
            <button onclick="showSection('subcontractors'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span class="nav-label text-sm">Sous-Traitants</span>
            </button>

            <div class="text-xs font-semibold text-flup-gray uppercase tracking-wider mb-2 mt-6 px-2 nav-label">Médias & Comms</div>
            <button onclick="showSection('messages'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors relative">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                <span class="nav-label text-sm">Messages</span>
                <span id="unreadBadge" class="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full hidden"></span>
            </button>
            <button onclick="showSection('gallery'); updateActiveNav(this)" id="nav-gallery" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span class="nav-label text-sm">Photos</span>
            </button>
            <button onclick="showSection('historique'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="nav-label text-sm">Historique (Docs)</span>
            </button>

            <div class="text-xs font-semibold text-flup-gray uppercase tracking-wider mb-2 mt-6 px-2 nav-label">Finances</div>
            <button onclick="showSection('invoices'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="nav-label text-sm">Factures</span>
            </button>
            <button onclick="showSection('budget'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="nav-label text-sm">Budget</span>
            </button>
            <button onclick="showSection('marge'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <span class="nav-label text-sm">Rentabilité</span>
            </button>
            <button onclick="showSection('plusvalues'); updateActiveNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-flup-gray hover:bg-gray-50 hover:text-flup-dark font-medium transition-colors">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="nav-label text-sm">Plus-Values</span>
            </button>

            <!-- Other hidden functionally required links -->
            <button onclick="showSection('inspections'); updateActiveNav(this)" class="nav-btn-flup hidden"></button>
            <button onclick="showSection('tenders'); updateActiveNav(this)" class="nav-btn-flup hidden"></button>
            <button onclick="showSection('newclient'); updateActiveNav(this)" class="nav-btn-flup hidden"></button>
        </nav>

        <!-- Bottom Actions (Prompt 1: Dark Mode Toggle & Profile) -->
        <div class="p-4 border-t border-flup-border">
            <div class="flex items-center justify-between mb-4 px-2 nav-label">
                <div class="flex items-center gap-2 text-sm text-flup-gray font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    Dark mode
                </div>
                <button class="w-8 h-4 bg-gray-200 rounded-full relative cursor-not-allowed">
                    <div class="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow"></div>
                </button>
            </div>
            <div class="flex items-center gap-3 px-2 py-2">
                <div class="w-9 h-9 rounded-full bg-cover bg-center bg-[url('https://ui-avatars.com/api/?name=Admin&background=10B981&color=fff')]"></div>
                <div class="flex-1 min-w-0 nav-label">
                    <p class="text-sm font-bold text-flup-dark truncate">Admin Manager</p>
                    <p class="text-xs text-flup-gray truncate" id="adminEmail">admin@ibe.com</p>
                </div>
            </div>
            <button onclick="doLogout()" class="mt-2 w-full flex items-center gap-2 px-2 py-2 text-sm text-flup-gray hover:text-red-500 font-medium transition-colors nav-label">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3-3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Log out
            </button>
        </div>
    </aside>

    <script>
        // Inline helper to manage active states for Flup Sidebar
        function updateActiveNav(btn) {
            document.querySelectorAll('.nav-btn-flup').forEach(b => {
                b.classList.remove('bg-flup-greenLight', 'text-flup-green');
                b.classList.add('text-flup-gray', 'hover:bg-gray-50', 'hover:text-flup-dark');
            });
            btn.classList.add('bg-flup-greenLight', 'text-flup-green');
            btn.classList.remove('text-flup-gray', 'hover:bg-gray-50', 'hover:text-flup-dark');
        }
    </script>
`;

html = html.replace(sidebarRegex, newSidebar);

// 4. Update the main container classes
html = html.replace(/<div class="main">/, '<div class="main flex-1 ml-64 bg-flup-bg min-h-screen transition-all duration-300 flex flex-col">');

// 5. Replace Topbar
const topbarStart = html.indexOf('<div class="topbar">');
let contentIdx = html.indexOf('<div class="content">', topbarStart);
// if not found exactly as <div class="content"> try finding the prefix
if (contentIdx === -1) {
    contentIdx = html.indexOf('<div class="content', topbarStart);
}

if(topbarStart !== -1 && contentIdx !== -1) {
    const topbarMatch = html.substring(topbarStart, contentIdx);
    const newTopbar = `
        <!-- NEW FLUP TOPBAR -->
        <header class="h-20 bg-transparent flex items-center justify-between px-8 shrink-0">
            <h1 class="text-2xl font-bold text-flup-dark tracking-tight" id="topbarTitle">Dashboard</h1>
            
            <div class="flex items-center gap-4">
                <!-- Prompt 2: Sélecteur de période -->
                <div class="bg-white border border-flup-border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-flup-gray cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                    Time period: <span class="text-flup-dark">All-time</span>
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </header>
    `;
    html = html.replace(topbarMatch, newTopbar);
}

// 6. Replace sec-overview entirely with the prompt's layout (KPIs + Charts + Table appended)
const secOverviewStart = html.indexOf('<div id="sec-overview" class="section active">');
const secOverviewEnd = html.indexOf('<!-- ═══ CLIENTS ═══ -->');

if (secOverviewStart !== -1 && secOverviewEnd !== -1) {
    // Keep the "Activité récente" table HTML to append at the bottom
    const overviewContent = html.substring(secOverviewStart, secOverviewEnd);
    const tableRegex = /<div class="card">[\s\S]*?<div class="card-title">Activité récente — Clients<\/div>[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/;
    const tableMatch = overviewContent.match(tableRegex);
    const recentTableHtml = tableMatch ? tableMatch[0] : '';
    
    // Convert current table styling to Tailwind so it blends nicely
    let tailwindTable = recentTableHtml.replace(/class="card"/, 'class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"');
    tailwindTable = tailwindTable.replace('class="card-title"', 'class="text-lg font-bold text-flup-dark mb-4"');
    tailwindTable = tailwindTable.replace(/class="table"/g, 'class="w-full text-left border-collapse"');
    tailwindTable = tailwindTable.replace(/<th>/g, '<th class="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">');
    // For td we need CSS, but since we keep the <style> block it should inherit mostly fine, 
    // we'll just let the original table structure render below.

    const newOverview = `
    <!-- ═══ OVERVIEW (FLUP DESIGN) ═══ -->
    <div id="sec-overview" class="section active px-8 pb-8">
        
        <!-- PROMPT 2: 4 petites cartes KPIs -->
        <div class="grid grid-cols-4 gap-6 mb-6" id="statsGrid">
            <!-- 1. Avancement global -->
            <div class="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-shadow">
                <div class="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-flup-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    Avancement global
                </div>
                <div class="flex items-end gap-3 mt-1">
                    <span class="text-3xl font-bold text-flup-dark tracking-tight" id="statAvg">0%</span>
                    <span class="flex items-center text-xs font-bold text-flup-green bg-flup-greenLight/50 px-2 py-0.5 rounded-full mb-1">
                        <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        12%
                    </span>
                </div>
            </div>

            <!-- 2. Budget Total (using Projets count + static placeholder) -->
            <div class="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-shadow">
                <div class="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-flup-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Budget Total
                </div>
                <div class="flex items-end gap-3 mt-1 relative">
                    <span class="text-3xl font-bold text-flup-dark tracking-tight">1.0 M</span>
                    <span class="text-sm font-semibold text-gray-400 absolute bottom-1 right-0">MAD</span>
                </div>
            </div>

            <!-- 3. Dépenses (using Clients count + static placeholder) -->
            <div class="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-shadow">
                <div class="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-flup-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Dépenses
                </div>
                <div class="flex items-end gap-3 mt-1 relative">
                    <span class="text-3xl font-bold text-flup-dark tracking-tight">249 K</span>
                    <span class="text-sm font-semibold text-gray-400 absolute bottom-1 right-0">MAD</span>
                </div>
            </div>

            <!-- 4. Documents / Fichiers -->
            <div class="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-shadow relative">
                <div class="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-flup-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    Documents
                </div>
                <div class="flex items-end gap-3 mt-1">
                    <span class="text-3xl font-bold text-flup-dark tracking-tight">12</span>
                    <span class="text-sm font-semibold text-gray-400 absolute bottom-1 right-[20px]">Fichiers</span>
                </div>
                <!-- Extra + Add Data Block from Flup design -->
                <div class="absolute right-[10px] top-[10px] bottom-[10px] flex items-center pr-[10px]">
                    <button class="w-12 h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors" onclick="showSection('invoices'); updateActiveNav(document.querySelectorAll('.nav-btn-flup')[8])">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mb-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span class="text-[9px] font-medium">Add</span>
                    </button>
                </div>
            </div>
            
            <!-- Hidden original stats so JS doesn't crash -->
            <div class="hidden">
                 <span id="statProjects"></span>
                 <span id="statClients"></span>
                 <span id="statMsgs"></span>
            </div>
        </div>

        <!-- PROMPT 3: Le graphique principal (Centre) -->
        <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 mb-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-bold text-flup-dark">Évolution des dépenses</h2>
                <div class="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-blue-500"></div> Gros œuvre</div>
                    <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-orange-400"></div> Finitions</div>
                </div>
            </div>
            <div class="h-64 w-full">
                <canvas id="mainBarChart"></canvas>
            </div>
        </div>

        <!-- PROMPT 4: Les graphiques du bas (Donut et Liste) -->
        <div class="grid grid-cols-3 gap-6 mb-8">
            <!-- Donut Chart -->
            <div class="col-span-1 border border-gray-100 bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <h2 class="text-base font-bold text-flup-dark mb-4">Répartition du budget</h2>
                <div class="h-[180px] relative flex items-center justify-center">
                    <canvas id="donutChart"></canvas>
                </div>
                <div class="grid grid-cols-2 gap-x-2 gap-y-3 mt-4 text-[10px] sm:text-[11px] font-semibold text-gray-500">
                    <div class="flex items-center gap-2"><div class="w-2.5 h-1.5 rounded-sm bg-[#8B5CF6]"></div> Gros Œuv. - 75%</div>
                    <div class="flex items-center gap-2"><div class="w-2.5 h-1.5 rounded-sm bg-[#3B82F6]"></div> Sec. Œuv. - 10%</div>
                    <div class="flex items-center gap-2"><div class="w-2.5 h-1.5 rounded-sm bg-[#F43F5E]"></div> Finitions - 10%</div>
                    <div class="flex items-center gap-2"><div class="w-2.5 h-1.5 rounded-sm bg-[#10B981]"></div> Equipement - 5%</div>
                </div>
            </div>

            <!-- Etapes du chantier (Right side) -->
            <div class="col-span-2 border border-gray-100 bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <h2 class="text-base font-bold text-flup-dark mb-4">Étapes du chantier</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-3 h-3 rounded-full bg-flup-green"></div>
                            <span class="text-sm font-semibold text-flup-dark">Études & Plans</span>
                        </div>
                        <span class="text-xs font-bold text-flup-green px-3 py-1 bg-flup-greenLight/50 rounded-full">Terminé</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-3 h-3 rounded-full bg-flup-green"></div>
                            <span class="text-sm font-semibold text-flup-dark">Permis de construire</span>
                        </div>
                        <span class="text-xs font-bold text-flup-green px-3 py-1 bg-flup-greenLight/50 rounded-full">Terminé</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                            <span class="text-sm font-semibold text-flup-dark">Gros œuvre</span>
                        </div>
                        <span class="text-xs font-bold text-blue-500 px-3 py-1 bg-blue-50 rounded-full">En cours</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                            <span class="text-sm font-semibold text-gray-500">Second œuvre</span>
                        </div>
                        <span class="text-xs font-bold text-gray-400 px-3 py-1 bg-gray-50 rounded-full">En attente</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Inject Old Table Here so functional bindings still work -->
        <div class="w-full">
            ${tailwindTable}
        </div>
    </div>
    `;

    html = html.substring(0, secOverviewStart) + newOverview + html.substring(secOverviewEnd);
}

// 7. Inject Chart.js initialization code at the very end of the file
const chartJsScript = `
<script>
// Mock data for Flup requested charts
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to ensure canvas is in DOM
    setTimeout(() => {
        const barCtx = document.getElementById('mainBarChart');
        if(barCtx) {
            new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
                    datasets: [
                        {
                            label: 'Gros œuvre',
                            data: [20, 35, 20, 32, 53, 53, 16],
                            backgroundColor: '#3B82F6',
                            borderRadius: 4,
                            barPercentage: 0.6,
                            categoryPercentage: 0.4
                        },
                        {
                            label: 'Finitions',
                            data: [37, 45, 57, 43, 44, 57, 37],
                            backgroundColor: '#FB923C',
                            borderRadius: 4,
                            barPercentage: 0.6,
                            categoryPercentage: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#fff',
                            titleColor: '#6B7280',
                            bodyColor: '#1F2937',
                            bodyFont: { weight: 'bold', size: 14 },
                            borderColor: '#E5E7EB',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    return context.raw + 'K MAD';
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11, weight: '500' } } },
                        y: { grid: { color: '#F3F4F6', drawBorder: false }, border: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 }, callback: function(value) { return value + ' K'; } } }
                    }
                }
            });
        }

        const donutCtx = document.getElementById('donutChart');
        if(donutCtx) {
            new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Gros Œuvre', 'Second Œuvre', 'Finitions', 'Équipements'],
                    datasets: [{
                        data: [75, 10, 10, 5],
                        backgroundColor: ['#8B5CF6', '#3B82F6', '#F43F5E', '#10B981'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }
    }, 500);
});
</script>
</body>
`;
html = html.replace(/<\/body>/, chartJsScript);

// 8. Fix missing padding/layout on other sections
html = html.replace(/class="content"/, 'class="content px-8 pb-8 flex-1 overflow-y-auto"'); // Ensures content is padded and scrolls correctly
// Fix card styles globally for tailwind integration
html = html.replace(/class="card"/g, 'class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-6"');

fs.writeFileSync('./portal/admin.html', html);
console.log('Successfully injected Tailwind CSS and Flup Layout into admin.html');
