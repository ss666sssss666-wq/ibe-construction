const fs = require('fs');

function applyFlupToAdmin() {
    console.log('Applying Flup to admin.html...');
    let html = fs.readFileSync('./portal/admin.html', 'utf8');

    // 1. Inject Tailwind and Essential Styles
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
                    }
                }
            }
        }
    </script>
    <style type="text/css">
        body { font-family: 'Inter', sans-serif !important; background-color: #F4F7F6 !important; }
        .main { margin-left: 256px !important; transition: margin-left 0.3s ease !important; }
        @media (max-width: 1024px) { .main { margin-left: 0 !important; } }
        #loadingScreen.hide { opacity: 0; pointer-events: none; transition: opacity 0.5s ease; }
        .nav-btn-flup.active-flup { background-color: #D1FAE5; color: #10B981; font-weight: 700; shadow: 0 1px 2px rgba(0,0,0,0.05); }
    </style>
</head>`);
    }

    // 2. Overhaul Sidebar (Keep class="sidebar" for JS compatibility)
    const sidebarRegex = /<aside class="sidebar">[\s\S]*?<\/aside>/;
    const newSidebar = `
    <!-- Functional Sidebar Overlay for Mobile JS -->
    <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 z-40 hidden"></div>
    
    <aside class="sidebar w-64 bg-white border-r border-flup-border h-screen fixed left-0 top-0 hidden lg:flex flex-col z-50 transition-all duration-300" id="flupSidebar">
        <div class="h-20 flex items-center px-6 border-b border-flup-border gap-3">
            <div class="w-10 h-10 rounded-xl bg-flup-green flex items-center justify-center text-white font-black italic shadow-lg shadow-green-200">IBE</div>
            <span class="font-bold text-flup-dark text-xl tracking-tight">Portail IBE</span>
        </div>

        <nav class="flex-1 overflow-y-auto py-8 px-4 space-y-2">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Menu Principal</div>
            
            <button onclick="showSection('overview'); activateFlupNav(this)" class="nav-btn-flup active-flup w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span class="text-sm">Tableau de bord</span>
            </button>

            <button onclick="showSection('clients'); activateFlupNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-4 py-3 rounded-xl text-flup-gray hover:bg-gray-50 font-medium transition-all">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span class="text-sm">Clients</span>
            </button>

            <button onclick="showSection('projects'); activateFlupNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-4 py-3 rounded-xl text-flup-gray hover:bg-gray-50 font-medium transition-all">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <span class="text-sm">Projets</span>
            </button>
            
            <button onclick="showSection('messages'); activateFlupNav(this)" class="nav-btn-flup w-full flex items-center gap-3 px-4 py-3 rounded-xl text-flup-gray hover:bg-gray-50 font-medium transition-all">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                <span class="text-sm">Messages</span>
            </button>
        </nav>

        <div class="p-6 border-t border-flup-border">
            <div class="flex items-center gap-4 mb-4">
                <div id="adminAvatar" class="w-10 h-10 rounded-full bg-flup-green flex items-center justify-center text-white font-black text-xs">A</div>
                <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-bold text-gray-400 uppercase">Admin</p>
                    <p class="text-xs font-bold text-flup-dark truncate" id="adminEmail">...</p>
                </div>
            </div>
            <button onclick="doLogout()" class="w-full flex items-center gap-3 text-red-500 font-bold hover:bg-red-50 px-3 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Déconnexion
            </button>
        </div>
    </aside>
    <script>
        function activateFlupNav(btn) {
            document.querySelectorAll('.nav-btn-flup').forEach(b => {
                b.classList.remove('active-flup', 'bg-flup-greenLight', 'text-flup-green', 'font-bold');
                b.classList.add('text-flup-gray', 'font-medium');
            });
            btn.classList.add('active-flup');
            btn.classList.remove('text-flup-gray', 'font-medium');
        }
    </script>
    `;
    html = html.replace(sidebarRegex, newSidebar);

    // 3. Update Topbar
    const topbarRegex = /<div class="topbar">[\s\S]*?<\/div>(\s*<\/div>)?|<header[^>]*>[\s\S]*?<\/header>/;
    const newTopbar = `
    <header class="h-20 bg-transparent flex items-center justify-between px-8 mb-4">
        <div>
            <h1 class="text-2xl font-black text-flup-dark tracking-tight" id="topbarTitle">Dashboard</h1>
            <p class="text-xs text-gray-400 font-medium">Gestion IBE Construction</p>
        </div>
        <div class="w-10 h-10 rounded-full border-2 border-white shadow-md bg-emerald-500 flex items-center justify-center text-white font-bold">IBE</div>
    </header>`;
    html = html.replace(topbarRegex, newTopbar);

    fs.writeFileSync('./portal/admin.html', html);
    console.log('Fixed admin.html with class="sidebar" and IDs');
}

function applyFlupToDashboard() {
    console.log('Applying Flup to dashboard.html...');
    let html = fs.readFileSync('./portal/dashboard.html', 'utf8');

    // 1. Inject Tailwind
    if (!html.includes('cdn.tailwindcss.com')) {
        html = html.replace('</head>', `
    <script src="https://cdn.tailwindcss.com"></script>
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
                    }
                }
            }
        }
    </script>
    <style type="text/css">
        body { font-family: 'Inter', sans-serif !important; background-color: #F4F7F6 !important; }
        .app-content { margin-left: 256px !important; transition: margin-left 0.3s ease !important; }
        @media (max-width: 1024px) { .app-content { margin-left: 0 !important; } }
        #loadingScreen.hide { opacity: 0; pointer-events: none; }
    </style>
</head>`);
    }

    // 2. Add adminFailSafeBtn (Hidden but present for JS)
    if (!html.includes('id="adminFailSafeBtn"')) {
        html = html.replace('</body>', '<button id="adminFailSafeBtn" style="display:none"></button></body>');
    }

    // 3. Update Header (Fix IDs: topbarProjectName, topbarClientName, avatarBtn)
    const headerRegex = /<header class="h-20 bg-transparent flex items-center justify-between px-8 mb-6">[\s\S]*?<\/header>|<div class="topbar">[\s\S]*?<\/div>(\s*<\/div>)?/;
    const newHeader = `
    <header class="h-20 bg-transparent flex items-center justify-between px-8 mb-6">
        <div>
            <h1 class="text-2xl font-black text-flup-dark tracking-tight" id="topbarProjectName">Mon Projet</h1>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1" id="topbarClientName">...</p>
        </div>
        <div class="flex items-center gap-4">
            <div id="avatarBtn" class="w-10 h-10 rounded-xl bg-flup-green flex items-center justify-center text-white font-black shadow-md">C</div>
            <button onclick="doLogout()" class="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline">Déconnexion</button>
        </div>
    </header>`;
    html = html.replace(headerRegex, newHeader);

    // 4. Update Progress Banner (Fix IDs: pctLabel, progressBarFill, bannerTitle, bannerSub, progressCircle)
    const bannerRegex = /<div class="bg-white rounded-\[32px\] p-8 shadow-sm border border-gray-50 mx-6 mb-8 flex flex-col md:flex-row items-center gap-8">[\s\S]*?<\/div>|class="progress-banner"[\s\S]*?<\/div>/;
    const newBanner = `
    <div class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 mx-6 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div class="relative w-24 h-24 flex-shrink-0">
             <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" stroke-width="8"></circle>
                <circle id="progressCircle" cx="50" cy="50" r="45" fill="none" stroke="#10B981" stroke-width="8" stroke-dasharray="283" stroke-dashoffset="283" stroke-linecap="round" class="transition-all duration-1000"></circle>
             </svg>
             <div class="absolute inset-0 flex items-center justify-center text-xl font-black text-flup-dark" id="pctLabel">0%</div>
        </div>
        <div class="flex-1">
            <h2 class="text-xl font-black text-flup-dark" id="bannerTitle">Mise à jour du chantier</h2>
            <div class="w-full bg-gray-100 h-3 rounded-full mt-4 overflow-hidden shadow-inner">
                <div id="progressBarFill" class="bg-flup-green h-full rounded-full transition-all duration-1000" style="width: 0%"></div>
            </div>
            <p class="text-sm text-gray-400 font-medium mt-3" id="bannerSub">...</p>
        </div>
    </div>`;
    html = html.replace(bannerRegex, newBanner);

    fs.writeFileSync('./portal/dashboard.html', html);
    console.log('Fixed dashboard.html with all required IDs');
}

applyFlupToAdmin();
applyFlupToDashboard();
