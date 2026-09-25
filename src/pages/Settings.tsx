import React from 'react';
import {
  Database,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Code2,
  FileCode,
  KeyRound,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { isSupabaseConfigured, getSupabaseConfigInfo } from '../lib/supabase';

const teamRoster = [
  {
    number: 1,
    name: 'Member 1 (You)',
    role: 'Base Architecture & Auth Foundation',
    modules: ['Layout (Sidebar, Header)', 'Authentication & Context', 'Routing & Base Types', 'Supabase Client Setup'],
    files: ['src/components/layout/*', 'src/contexts/AuthContext.tsx', 'src/routes/*', 'src/lib/supabase.ts'],
    status: 'Complete & Active',
  },
  {
    number: 2,
    name: 'Ranjith Kumar',
    role: 'Products & Stock Management',
    modules: ['Product Catalog', 'Inventory Tracking', 'Low-Stock Alerts', 'SKU Management'],
    files: ['src/pages/Products.tsx', 'src/pages/Inventory.tsx', 'src/contexts/ProductContext.tsx'],
    status: 'Implemented & Active',
  },
  {
    number: 3,
    name: 'Prithvi',
    role: 'Sales & Billing Terminal',
    modules: ['Point of Sale (POS)', 'Billing & Invoicing', 'Sales History', 'Find My Bill & Digital Receipts'],
    files: ['src/pages/Sales.tsx', 'src/pages/SalesHistory.tsx'],
    status: 'Ready for Implementation',
  },
  {
    number: 4,
    name: 'Keerthana',
    role: 'Dashboard & Reports Analytics',
    modules: ['Executive Dashboard', 'Sales & Margin Reports', 'Data Charts', 'Final Testing & Integration'],
    files: ['src/pages/Dashboard.tsx', 'src/pages/Reports.tsx'],
    status: 'Ready for Implementation',
  },
];

export const Settings: React.FC = () => {
  const supabaseInfo = getSupabaseConfigInfo();

  return (
    <PageContainer
      subtitle="Application configuration, team responsibilities, and Supabase integration status."
    >
      <div className="space-y-6">
        {/* Supabase Connection Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <CardTitle>Supabase Database Integration</CardTitle>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
              >
                {isSupabaseConfigured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Foundation Mode (Unconfigured)</span>
                  </>
                )}
              </div>
            </div>
            <CardDescription>
              Environment-based backend storage configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Project URL Status:</span>
                <span className="font-mono text-slate-800">{supabaseInfo.urlPreview}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Anon API Key Provided:</span>
                <span className="font-semibold text-slate-800">
                  {supabaseInfo.hasAnonKey ? 'Yes (configured)' : 'No (pending team setup)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Client Wrapper:</span>
                <span className="font-mono text-indigo-600">src/lib/supabase.ts (Safe wrapper active)</span>
              </div>
            </div>

            <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 p-4 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-indigo-900">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>How to connect your team's Supabase project:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>Create a free project at <span className="font-semibold text-slate-800">supabase.com</span></li>
                <li>Go to <strong className="text-slate-800">Project Settings → API</strong> and copy your Project URL & Anon Public Key.</li>
                <li>Add them to your local <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-800">.env</code> file (or host environment variables):</li>
              </ol>
              <pre className="bg-slate-900 text-slate-200 p-3 rounded-md font-mono text-[11px] overflow-x-auto mt-2">
                {`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...your-anon-key`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* 4-Member Team Ownership Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <CardTitle>Team Responsibility Matrix & Golden Rules</CardTitle>
            </div>
            <CardDescription>
              Module ownership for seamless multi-developer contribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamRoster.map((member) => (
                <div
                  key={member.number}
                  className="rounded-xl border border-slate-200 p-4 bg-white hover:border-slate-300 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Member {member.number}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {member.name}
                      </h4>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${member.status.includes('Active')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    {member.role}
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500 mb-1">
                      Assigned Modules:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.modules.map((m) => (
                        <span
                          key={m}
                          className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
                    <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-mono text-[10.5px] text-slate-600">
                      {member.files.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Golden Rule banner */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 flex items-start gap-3 mt-4">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-white text-sm">
                  Team Collaboration Golden Rule
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Before modifying code: identify who is making the change, which module they own, which files they are allowed to modify, and what existing functionality must NOT be changed. Never overwrite another member's module without explicit agreement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <CardTitle>Architecture Stack</CardTitle>
            </div>
            <CardDescription>
              Production base stack specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <p className="text-slate-500 font-medium">Frontend Framework</p>
                <p className="font-semibold text-slate-900 mt-1">React 19 + TypeScript</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <p className="text-slate-500 font-medium">Bundler & Dev Server</p>
                <p className="font-semibold text-slate-900 mt-1">Vite</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <p className="text-slate-500 font-medium">Styling & UI</p>
                <p className="font-semibold text-slate-900 mt-1">Tailwind CSS</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <p className="text-slate-500 font-medium">Database Target</p>
                <p className="font-semibold text-slate-900 mt-1">Supabase (PostgreSQL)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
