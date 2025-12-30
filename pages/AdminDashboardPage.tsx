
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService, AdminDashboardData, AdminUserData, AdminQRCodeData } from '../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import {
  UserPlusIcon,
  UserCheckIcon,
  QrCodeIcon,
  ClockIcon,
  UserXIcon,
  UsersIcon,
  MessageCircleIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  FilterIcon,
  DownloadIcon,
  SendIcon
} from '../components/icons';

const getLocalDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const formatDateOnly = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDisplayPhone = (phone: string | null): string => {
  if (!phone) return '-';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.substring(2);
  } else if (digits.startsWith('55') && digits.length === 11 && !digits.startsWith('559')) {
    digits = digits.substring(2);
  }
  if (digits.length < 2) return phone;
  const ddd = digits.substring(0, 2);
  let number = digits.substring(2);
  if (number.length === 8) {
    number = '9' + number;
  }
  if (number.length === 9) {
    return `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
  }
  return `(${ddd}) ${number}`;
};

// --- CHART COMPONENTS ---

interface ChartSeries {
  label: string;
  data: number[];
  color: string;
}

const SimpleLineChart: React.FC<{ title: string; series: ChartSeries[]; labels: string[]; isCurrency?: boolean }> = ({ title, series, labels, isCurrency }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 30;

  const maxVal = Math.max(...series.flatMap(s => s.data), 10);

  const points = useMemo(() => {
    return series.map(s => {
      return s.data.map((val, i) => {
        const x = (i / (labels.length - 1)) * (chartWidth - padding * 2) + padding;
        const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
        return { x, y, val };
      });
    });
  }, [series, labels.length, maxVal]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow relative pt-4">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line
              key={i}
              x1={padding}
              y1={chartHeight - padding - p * (chartHeight - padding * 2)}
              x2={chartWidth - padding}
              y2={chartHeight - padding - p * (chartHeight - padding * 2)}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="4"
            />
          ))}

          {points.map((pList, sIdx) => (
            <path
              key={`area-${sIdx}`}
              d={`M ${pList[0].x} ${chartHeight - padding} ${pList.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${pList[pList.length - 1].x} ${chartHeight - padding} Z`}
              fill={series[sIdx].color}
              fillOpacity="0.05"
            />
          ))}

          {points.map((pList, sIdx) => (
            <path
              key={`line-${sIdx}`}
              d={`M ${pList.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke={series[sIdx].color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
          ))}

          {labels.map((_, i) => {
            const xPos = (i / (labels.length - 1)) * (chartWidth - padding * 2) + padding;
            return (
              <g key={`interaction-${i}`}>
                <rect
                  x={xPos - 10}
                  y={0}
                  width={20}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="cursor-pointer"
                />
                {hoverIndex === i && (
                  <>
                    <line x1={xPos} y1={padding} x2={xPos} y2={chartHeight - padding} stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4" />
                    {points.map((pList, sIdx) => (
                      <circle key={`dot-${sIdx}`} cx={pList[i].x} cy={pList[i].y} r="4" fill={series[sIdx].color} stroke="white" strokeWidth="1.5" />
                    ))}
                  </>
                )}
              </g>
            );
          })}

          {labels.map((label, i) => {
            // Mostra apenas alguns labels se houver muitos (como no caso de 24h)
            if (labels.length > 10 && i % 4 !== 0 && i !== labels.length - 1) return null;

            return (
              <text
                key={i}
                x={(i / (labels.length - 1)) * (chartWidth - padding * 2) + padding}
                y={chartHeight - 10}
                fontSize="9"
                textAnchor="middle"
                fill="currentColor"
                fillOpacity="0.5"
              >
                {label}
              </text>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <div
            className="absolute z-10 bg-card border shadow-xl rounded-lg p-3 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `${(hoverIndex / (labels.length - 1)) * 100}%`,
              top: '10px',
              transform: hoverIndex > labels.length / 2 ? 'translateX(-110%)' : 'translateX(10%)'
            }}
          >
            <p className="font-bold mb-2 border-b pb-1">{labels[hoverIndex]}</p>
            {series.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.label}:</span>
                </div>
                <span className="font-black">
                  {isCurrency ? `R$ ${s.data[hoverIndex].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : s.data[hoverIndex]}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap gap-3">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </CardFooter>
    </Card>
  );
};

// --- STAT CARD COMPONENT ---

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void
}> = ({ title, value, icon, onClick }) => (
  <Card
    className={`transition-all ${onClick ? 'cursor-pointer hover:bg-accent/50 hover:shadow-md active:scale-95' : ''}`}
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2 gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-center">{value}</div>
    </CardContent>
  </Card>
);

// --- MAIN PAGE COMPONENT ---

const AdminDashboardPage: React.FC = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(getLocalDateString(sevenDaysAgo));
  const [endDate, setEndDate] = useState(getLocalDateString(today));
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // CRM Filter states
  const [crmDateFrom, setCrmDateFrom] = useState('');
  const [crmDateTo, setCrmDateTo] = useState('');
  const [crmStatus, setCrmStatus] = useState('both');
  const [crmQrMin, setCrmQrMin] = useState('');
  const [crmBirthDateFrom, setCrmBirthDateFrom] = useState('');
  const [crmBirthDateTo, setCrmBirthDateTo] = useState('');
  const [crmAccessStatus, setCrmAccessStatus] = useState('both');

  // State para Modais e Paginação
  const [isUsersModalOpen, setUsersModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<AdminUserData[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [isUsersActiveModalOpen, setUsersActiveModalOpen] = useState(false);
  const [activeUsersList, setActiveUsersList] = useState<AdminUserData[]>([]);
  const [activeUsersTotal, setActiveUsersTotal] = useState(0);
  const [activeUsersPage, setActiveUsersPage] = useState(1);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(false);

  const [isUsersInactiveModalOpen, setUsersInactiveModalOpen] = useState(false);
  const [inactiveUsersList, setInactiveUsersList] = useState<AdminUserData[]>([]);
  const [inactiveUsersTotal, setInactiveUsersTotal] = useState(0);
  const [inactiveUsersPage, setInactiveUsersPage] = useState(1);
  const [loadingInactiveUsers, setLoadingInactiveUsers] = useState(false);

  const [isQrActiveModalOpen, setQrActiveModalOpen] = useState(false);
  const [qrActiveList, setQrActiveList] = useState<AdminQRCodeData[]>([]);
  const [qrActiveTotal, setQrActiveTotal] = useState(0);
  const [qrActivePage, setQrActivePage] = useState(1);
  const [loadingQrActive, setLoadingQrActive] = useState(false);

  const [isQrInactiveModalOpen, setQrInactiveModalOpen] = useState(false);
  const [qrInactiveList, setQrInactiveList] = useState<AdminQRCodeData[]>([]);
  const [qrInactiveTotal, setQrInactiveTotal] = useState(0);
  const [qrInactivePage, setQrInactivePage] = useState(1);
  const [loadingQrInactive, setLoadingQrInactive] = useState(false);

  const [isUsersWithoutQrModalOpen, setUsersWithoutQrModalOpen] = useState(false);
  const [usersWithoutQrList, setUsersWithoutQrList] = useState<AdminUserData[]>([]);
  const [usersWithoutQrTotal, setUsersWithoutQrTotal] = useState(0);
  const [usersWithoutQrPage, setUsersWithoutQrPage] = useState(1);
  const [loadingUsersWithoutQr, setLoadingUsersWithoutQr] = useState(false);

  const itemsTake = 10;

  // Busca de Dados do Dashboard
  const fetchData = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError('');
    try {
      const fromDateStr = `${start}T00:00:00-03:00`;
      const toDateStr = `${end}T23:59:59-03:00`;
      const result = await adminService.getDashboardData(fromDateStr, toDateStr);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar os dados do painel.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handlers de Busca para Modais
  const fetchUsers = useCallback(async (page: number) => {
    setLoadingUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getCreatedUsers(itemsTake, skip);
      setUsersList(response.items || []);
      setUsersTotal(response.total || 0);
    } finally { setLoadingUsers(false); }
  }, []);

  const fetchActiveUsers = useCallback(async (page: number) => {
    setLoadingActiveUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getActiveUsers(itemsTake, skip);
      setActiveUsersList(response.items || []);
      setActiveUsersTotal(response.total || 0);
    } finally { setLoadingActiveUsers(false); }
  }, []);

  const fetchInactiveUsers = useCallback(async (page: number) => {
    setLoadingInactiveUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getInactiveUsers(itemsTake, skip);
      setInactiveUsersList(response.items || []);
      setInactiveUsersTotal(response.total || 0);
    } finally { setLoadingInactiveUsers(false); }
  }, []);

  const fetchQrActive = useCallback(async (page: number) => {
    setLoadingQrActive(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getQRCodesByStatus('active', itemsTake, skip);
      setQrActiveList(response.items || []);
      setQrActiveTotal(response.total || 0);
    } finally { setLoadingQrActive(false); }
  }, []);

  const fetchQrInactive = useCallback(async (page: number) => {
    setLoadingQrInactive(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getQRCodesByStatus('inactive', itemsTake, skip);
      setQrInactiveList(response.items || []);
      setQrInactiveTotal(response.total || 0);
    } finally { setLoadingQrInactive(false); }
  }, []);

  const fetchUsersWithoutQr = useCallback(async (page: number) => {
    setLoadingUsersWithoutQr(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getUsersWithoutQRCodes(itemsTake, skip);
      setUsersWithoutQrList(response.items || []);
      setUsersWithoutQrTotal(response.total || 0);
    } finally { setLoadingUsersWithoutQr(false); }
  }, []);

  useEffect(() => { fetchData(startDate, endDate); }, [fetchData, startDate, endDate]);

  // Effects para carregar dados ao abrir modais
  useEffect(() => { if (isUsersModalOpen) fetchUsers(usersPage); }, [isUsersModalOpen, usersPage, fetchUsers]);
  useEffect(() => { if (isUsersActiveModalOpen) fetchActiveUsers(activeUsersPage); }, [isUsersActiveModalOpen, activeUsersPage, fetchActiveUsers]);
  useEffect(() => { if (isUsersInactiveModalOpen) fetchInactiveUsers(inactiveUsersPage); }, [isUsersInactiveModalOpen, inactiveUsersPage, fetchInactiveUsers]);
  useEffect(() => { if (isQrActiveModalOpen) fetchQrActive(qrActivePage); }, [isQrActiveModalOpen, qrActivePage, fetchQrActive]);
  useEffect(() => { if (isQrInactiveModalOpen) fetchQrInactive(qrInactivePage); }, [isQrInactiveModalOpen, qrInactivePage, fetchQrInactive]);
  useEffect(() => { if (isUsersWithoutQrModalOpen) fetchUsersWithoutQr(usersWithoutQrPage); }, [isUsersWithoutQrModalOpen, usersWithoutQrPage, fetchUsersWithoutQr]);

  // Limpeza de seleção ao fechar modais
  useEffect(() => {
    if (!isUsersModalOpen && !isUsersActiveModalOpen && !isUsersInactiveModalOpen && !isQrActiveModalOpen && !isQrInactiveModalOpen && !isUsersWithoutQrModalOpen) {
      setSelectedUserIds(new Set());
    }
  }, [isUsersModalOpen, isUsersActiveModalOpen, isUsersInactiveModalOpen, isQrActiveModalOpen, isQrInactiveModalOpen, isUsersWithoutQrModalOpen]);

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (list: (AdminUserData | AdminQRCodeData)[]) => {
    const ids = list.map(item => 'user' in item ? item.user.id : item.id);
    const allOnPageSelected = ids.every(id => selectedUserIds.has(id));
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };

  const handleWhatsAppRedirect = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  // --- CHART DATA GENERATION ---

  const dailyLabels = useMemo(() => {
    const labels = [];
    const date = new Date(today);
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() - (6 - i));
      labels.push(d.toLocaleDateString('pt-BR', { weekday: 'short' }));
    }
    return labels;
  }, []);

  const hourlyLabels = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);
  }, []);

  const revenueHourlySeries = useMemo(() => {
    // Simulação de receita por hora (00h às 23h)
    const data = [120, 80, 45, 20, 10, 5, 40, 150, 450, 890, 1200, 1500, 1800, 1600, 1400, 1300, 1250, 1600, 2100, 2400, 1900, 1500, 800, 300];
    return [{ label: 'Receita (R$)', data, color: '#10b981' }];
  }, []);

  const salesHourlySeries = useMemo(() => {
    // Simulação de quantidade de vendas por hora
    const data = [3, 2, 1, 0, 0, 0, 1, 4, 10, 18, 25, 30, 35, 32, 28, 26, 25, 32, 42, 48, 38, 30, 16, 6];
    return [{ label: 'Vendas (Unidades)', data, color: '#8b5cf6' }];
  }, []);

  const usersChartSeries = useMemo(() => {
    if (!data) return [];
    const generateSeries = (total: number) => {
      const result = [];
      let current = Math.floor(total * 0.7);
      for (let i = 0; i < 7; i++) {
        current += Math.floor(Math.random() * (total - current) / (7 - i));
        result.push(current);
      }
      result[6] = total;
      return result;
    };
    return [
      { label: 'Criados', data: generateSeries(data.usersCreated), color: '#3b82f6' },
      { label: 'Ativos', data: generateSeries(data.usersLoggedIn), color: '#10b981' },
      { label: 'Inativos', data: generateSeries(data.usersInactive ?? 0), color: '#6b7280' },
      { label: 'Sem QR', data: generateSeries(data.qrcodeNone), color: '#f59e0b' }
    ];
  }, [data]);

  const qrChartSeries = useMemo(() => {
    if (!data) return [];
    const generateSeries = (total: number) => {
      const result = [];
      let current = Math.floor(total * 0.8);
      for (let i = 0; i < 7; i++) {
        current += Math.floor(Math.random() * (total - current) / (7 - i));
        result.push(current);
      }
      result[6] = total;
      return result;
    };
    return [
      { label: 'Ativos', data: generateSeries(data.qrcodeActive), color: '#2dd4bf' },
      { label: 'Expirados', data: generateSeries(data.qrcodeExpired), color: '#ef4444' }
    ];
  }, [data]);

  // --- RENDERING HELPERS ---

  const renderSelectionCell = (userId: string) => (
    <td className="px-4 py-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        checked={selectedUserIds.has(userId)}
        onChange={() => toggleUserSelection(userId)}
        onClick={(e) => e.stopPropagation()}
      />
    </td>
  );

  const renderSelectAllHeader = (list: (AdminUserData | AdminQRCodeData)[]) => {
    const ids = list.map(item => 'user' in item ? item.user.id : item.id);
    return (
      <th className="px-4 py-3 w-10">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          checked={ids.length > 0 && ids.every(id => selectedUserIds.has(id))}
          onChange={() => toggleSelectAll(list)}
        />
      </th>
    );
  };

  const renderPagination = (page: number, total: number, setPage: React.Dispatch<React.SetStateAction<number>>, loading: boolean, currentListSize: number) => (
    <div className="flex items-center justify-between pt-2">
      <div className="text-xs text-muted-foreground">
        Mostrando <strong>{currentListSize}</strong> de <strong>{total}</strong> registros
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Anterior</Button>
        <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{page}</div>
        <Button variant="outline" size="sm" disabled={page * itemsTake >= total || loading} onClick={() => setPage(p => p + 1)}>Próximo</Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Painel Administrativo</h1>
          <p className="text-muted-foreground">Estatísticas e gerenciamento de usuários em tempo real.</p>
        </div>
      </div>

      <hr className="border-t border-border/40 my-6" />

      {!loading && data && (
        <div className="space-y-6">
          {/* New Hourly Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SimpleLineChart title="Receita (Últimas 24h)" series={revenueHourlySeries} labels={hourlyLabels} isCurrency={true} />
            <SimpleLineChart title="Volume de Vendas (Últimas 24h)" series={salesHourlySeries} labels={hourlyLabels} />
          </div>

          {/* Existing Weekly Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SimpleLineChart title="Crescimento de Usuários" series={usersChartSeries} labels={dailyLabels} />
            <SimpleLineChart title="Status de QR Codes" series={qrChartSeries} labels={dailyLabels} />
          </div>
          <hr className="border-t border-border/40 my-8" />
        </div>
      )}

      {error && <p className="text-center text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Carregando painel...</p>
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Usuários Criados" value={data.usersCreated} icon={<UserPlusIcon className="h-4 w-4" />} onClick={() => { setUsersPage(1); setUsersModalOpen(true); }} />
            <StatCard title="Usuários Ativos" value={data.usersLoggedIn} icon={<UserCheckIcon className="h-4 w-4" />} onClick={() => { setActiveUsersPage(1); setUsersActiveModalOpen(true); }} />
            <StatCard title="Usuários Inativos" value={data.usersInactive ?? 0} icon={<UsersIcon className="h-4 w-4" />} onClick={() => { setInactiveUsersPage(1); setUsersInactiveModalOpen(true); }} />
            <StatCard title="QR Codes Ativos" value={data.qrcodeActive} icon={<QrCodeIcon className="h-4 w-4" />} onClick={() => { setQrActivePage(1); setQrActiveModalOpen(true); }} />
            <StatCard title="QR Codes Expirados" value={data.qrcodeExpired} icon={<ClockIcon className="h-4 w-4" />} onClick={() => { setQrInactivePage(1); setQrInactiveModalOpen(true); }} />
            <StatCard title="Usuários sem QR Code" value={data.qrcodeNone} icon={<UserXIcon className="h-4 w-4" />} onClick={() => { setUsersWithoutQrPage(1); setUsersWithoutQrModalOpen(true); }} />
          </div>

          <hr className="border-t border-border/40 my-10" />

          {/* Seção de Gerenciamento Geral */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary" />
                Gerenciamento Geral de Usuários
              </CardTitle>
              <p className="text-sm text-muted-foreground">Realize ações administrativas diretamente na base de usuários cadastrados.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => { }}>
                <SearchIcon className="h-4 w-4" />
                Visualizar usuários
              </Button>
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => { }}>
                <PencilIcon className="h-4 w-4" />
                Editar Usuários
              </Button>
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive" onClick={() => { }}>
                <TrashIcon className="h-4 w-4" />
                Excluir Usuários
              </Button>
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => { }}>
                <KeyIcon className="h-4 w-4" />
                Redefinir Senha
              </Button>
            </CardContent>
          </Card>

          <hr className="border-t border-border/40 my-10" />

          {/* Seção de Comunicação e Filtros CRM */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-primary" />
                Comunicação e Filtros CRM
              </CardTitle>
              <p className="text-sm text-muted-foreground">Segmente sua base de usuários para campanhas direcionadas e exportações.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Período de Cadastro */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Período de Cadastro</label>
                  <div className="flex gap-2">
                    <Input type="date" value={crmDateFrom} onChange={(e) => setCrmDateFrom(e.target.value)} className="text-xs" />
                    <Input type="date" value={crmDateTo} onChange={(e) => setCrmDateTo(e.target.value)} className="text-xs" />
                  </div>
                </div>

                {/* Período de Aniversário */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Período de Aniversário</label>
                  <div className="flex gap-2">
                    <Input type="date" value={crmBirthDateFrom} onChange={(e) => setCrmBirthDateFrom(e.target.value)} className="text-xs" />
                    <Input type="date" value={crmBirthDateTo} onChange={(e) => setCrmBirthDateTo(e.target.value)} className="text-xs" />
                  </div>
                </div>

                {/* Status do Usuário */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status do Usuário</label>
                  <select
                    value={crmStatus}
                    onChange={(e) => setCrmStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="both">Ativos e Inativos</option>
                    <option value="active">Somente Ativos</option>
                    <option value="inactive">Somente Inativos</option>
                  </select>
                </div>

                {/* Histórico de Acesso */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Histórico de Acesso</label>
                  <select
                    value={crmAccessStatus}
                    onChange={(e) => setCrmAccessStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="both">Todos os usuários</option>
                    <option value="never">Usuários que NUNCA acessaram</option>
                    <option value="already">Usuários que JÁ acessaram</option>
                  </select>
                </div>

                {/* Qtd de QR Codes */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mín. de QR Codes</label>
                  <Input type="number" placeholder="Ex: 5" value={crmQrMin} onChange={(e) => setCrmQrMin(e.target.value)} className="text-xs" />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button variant="outline" className="font-bold flex items-center gap-2 hover:bg-primary/5" onClick={() => { }}>
                  <DownloadIcon className="h-4 w-4" />
                  Exportar Listagem
                </Button>
                <Button className="font-bold flex items-center gap-2" onClick={() => { }}>
                  <SendIcon className="h-4 w-4" />
                  Iniciar Comunicação
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* MODAL: Usuários Criados */}
      <Dialog isOpen={isUsersModalOpen} onClose={() => setUsersModalOpen(false)} title="Usuários Criados" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>{renderSelectAllHeader(usersList)}<th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">Já acessou</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">
                {usersList.map(user => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    {renderSelectionCell(user.id)}<td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center">{user.lastLogin ? '✅' : '❌'}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(usersPage, usersTotal, setUsersPage, loadingUsers, usersList.length)}
        </div>
      </Dialog>

      {/* MODAL: Usuários Ativos */}
      <Dialog isOpen={isUsersActiveModalOpen} onClose={() => setUsersActiveModalOpen(false)} title="Usuários Ativos" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>{renderSelectAllHeader(activeUsersList)}<th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">Último Acesso</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">
                {activeUsersList.map(user => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    {renderSelectionCell(user.id)}<td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center whitespace-nowrap">{formatDateTime(user.lastLogin)}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(activeUsersPage, activeUsersTotal, setActiveUsersPage, loadingActiveUsers, activeUsersList.length)}
        </div>
      </Dialog>

      {/* MODAL: Usuários Inativos */}
      <Dialog isOpen={isUsersInactiveModalOpen} onClose={() => setUsersInactiveModalOpen(false)} title="Usuários Inativos" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>{renderSelectAllHeader(inactiveUsersList)}<th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">
                {inactiveUsersList.map(user => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    {renderSelectionCell(user.id)}<td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center">Sem login</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(inactiveUsersPage, inactiveUsersTotal, setInactiveUsersPage, loadingInactiveUsers, inactiveUsersList.length)}
        </div>
      </Dialog>

      {/* MODAL: QR Codes Ativos */}
      <Dialog isOpen={isQrActiveModalOpen} onClose={() => setQrActiveModalOpen(false)} title="QR Codes Ativos" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>{renderSelectAllHeader(qrActiveList)}<th className="px-4 py-3">Evento</th><th className="px-4 py-3">Dono</th><th className="px-4 py-3">Expiração</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">
                {qrActiveList.map(qr => (
                  <tr key={qr.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(qr.user.id)}>
                    {renderSelectionCell(qr.user.id)}<td className="px-4 py-3 font-medium">{qr.eventName}</td><td className="px-4 py-3">{qr.user.name}</td><td className="px-4 py-3">{formatDateOnly(qr.expirationDate)}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(qr.user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(qrActivePage, qrActiveTotal, setQrActivePage, loadingQrActive, qrActiveList.length)}
        </div>
      </Dialog>

      {/* MODAL: QR Codes Expirados */}
      <Dialog isOpen={isQrInactiveModalOpen} onClose={() => setQrInactiveModalOpen(false)} title="QR Codes Expirados" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>{renderSelectAllHeader(qrInactiveList)}<th className="px-4 py-3">Evento</th><th className="px-4 py-3">Dono</th><th className="px-4 py-3">Expirou em</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">
                {qrInactiveList.map(qr => (
                  <tr key={qr.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(qr.user.id)}>
                    {renderSelectionCell(qr.user.id)}<td className="px-4 py-3 font-medium">{qr.eventName}</td><td className="px-4 py-3">{qr.user.name}</td><td className="px-4 py-3">{formatDateOnly(qr.expirationDate)}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(qr.user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(qrInactivePage, qrInactiveTotal, setQrInactivePage, loadingQrInactive, qrInactiveList.length)}
        </div>
      </Dialog>

      {/* MODAL: Usuários sem QR Code */}
      <Dialog isOpen={isUsersWithoutQrModalOpen} onClose={() => setUsersWithoutQrModalOpen(false)} title="Usuários sem QR Code" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>{renderSelectAllHeader(usersWithoutQrList)}<th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">
                {usersWithoutQrList.map(user => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    {renderSelectionCell(user.id)}<td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center">Sem QR gerado</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(usersWithoutQrPage, usersWithoutQrTotal, setUsersWithoutQrPage, loadingUsersWithoutQr, usersWithoutQrList.length)}
        </div>
      </Dialog>

      {selectedUserIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 ring-1 ring-black/5">
            <div className="flex flex-col border-r pr-6 border-border/50"><span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selecionados</span><span className="text-sm font-black text-primary">{selectedUserIds.size} usuários</span></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full font-semibold border-primary/20 hover:bg-primary/5" disabled>Criar comunicação</Button>
              <Button variant="outline" size="sm" className="rounded-full font-semibold border-primary/20 hover:bg-primary/5" disabled>Exportar</Button>
              <button onClick={() => setSelectedUserIds(new Set())} className="ml-2 p-1 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
