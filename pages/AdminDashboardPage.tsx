
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { adminService, authService, AdminDashboardData, AdminUserData, AdminQRCodeData } from '../services/mockApi';
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
  SendIcon,
  AlertTriangleIcon
} from '../components/icons';

const getLocalDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const formatDateOnly = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDisplayPhone = (phone: string | null | undefined): string => {
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

const applyPhoneMask = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length > 11) return value.substring(0, 15);
  let formatted = digits;
  if (digits.length > 2) {
    formatted = `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  }
  if (digits.length > 7) {
    formatted = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }
  return formatted;
};

const applyBirthDateMask = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length > 8) return value.substring(0, 10);
  let formatted = digits;
  if (digits.length > 2) {
    formatted = `${digits.substring(0, 2)}/${digits.substring(2)}`;
  }
  if (digits.length > 4) {
    formatted = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
  }
  return formatted;
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
            <line key={i} x1={padding} y1={chartHeight - padding - p * (chartHeight - padding * 2)} x2={chartWidth - padding} y2={chartHeight - padding - p * (chartHeight - padding * 2)} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4" />
          ))}
          {points.map((pList, sIdx) => (
            <path key={`area-${sIdx}`} d={`M ${pList[0].x} ${chartHeight - padding} ${pList.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${pList[pList.length - 1].x} ${chartHeight - padding} Z`} fill={series[sIdx].color} fillOpacity="0.05" />
          ))}
          {points.map((pList, sIdx) => (
            <path key={`line-${sIdx}`} d={`M ${pList.map(p => `${p.x},${p.y}`).join(' L ')}`} fill="none" stroke={series[sIdx].color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />
          ))}
          {labels.map((_, i) => {
            const xPos = (i / (labels.length - 1)) * (chartWidth - padding * 2) + padding;
            return (
              <g key={`interaction-${i}`}>
                <rect x={xPos - 10} y={0} width={20} height={chartHeight} fill="transparent" onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer" />
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
            if (labels.length > 10 && i % 4 !== 0 && i !== labels.length - 1) return null;
            return <text key={i} x={(i / (labels.length - 1)) * (chartWidth - padding * 2) + padding} y={chartHeight - 10} fontSize="9" textAnchor="middle" fill="currentColor" fillOpacity="0.5">{label}</text>;
          })}
        </svg>
        {hoverIndex !== null && (
          <div className="absolute z-10 bg-card border shadow-xl rounded-lg p-3 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-200" style={{ left: `${(hoverIndex / (labels.length - 1)) * 100}%`, top: '10px', transform: hoverIndex > labels.length / 2 ? 'translateX(-110%)' : 'translateX(10%)' }}>
            <p className="font-bold mb-2 border-b pb-1">{labels[hoverIndex]}</p>
            {series.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-muted-foreground">{s.label}:</span></div>
                <span className="font-black">{isCurrency ? `R$ ${s.data[hoverIndex].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : s.data[hoverIndex]}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap gap-3">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
          </div>
        ))}
      </CardFooter>
    </Card>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, icon, onClick }) => (
  <Card className={`transition-all ${onClick ? 'cursor-pointer hover:bg-accent/50 hover:shadow-md active:scale-95' : ''}`} onClick={onClick}>
    <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2 gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent><div className="text-2xl font-bold text-center">{value}</div></CardContent>
  </Card>
);

const AdminDashboardPage: React.FC = () => {
  const context = useContext(AppContext);
  const showToast = context?.showToast;
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(getLocalDateString(sevenDaysAgo));
  const [endDate, setEndDate] = useState(getLocalDateString(today));
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // CRM states
  const [crmDateFrom, setCrmDateFrom] = useState('');
  const [crmDateTo, setCrmDateTo] = useState('');
  const [crmStatus, setCrmStatus] = useState('both');
  const [crmQrMin, setCrmQrMin] = useState('');
  const [crmBirthDateFrom, setCrmBirthDateFrom] = useState('');
  const [crmBirthDateTo, setCrmBirthDateTo] = useState('');
  const [crmAccessStatus, setCrmAccessStatus] = useState('both');

  // Modals and Pagination
  const [isAllUsersModalOpen, setAllUsersModalOpen] = useState(false);
  const [allUsersList, setAllUsersList] = useState<AdminUserData[]>([]);
  const [allUsersTotal, setAllUsersTotal] = useState(0);
  const [allUsersPage, setAllUsersPage] = useState(1);
  const [allUsersSort, setAllUsersSort] = useState('name');
  const [allUsersOrder, setAllUsersOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);

  // Edit states
  const [isEditUsersListModalOpen, setEditUsersListModalOpen] = useState(false);
  const [isEditUserDetailModalOpen, setEditUserDetailModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUserData | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserBirthDate, setEditUserBirthDate] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [saveUserError, setSaveUserError] = useState('');

  // Reset Password states
  const [isResetPasswordListModalOpen, setResetPasswordListModalOpen] = useState(false);
  const [isResetPasswordFormModalOpen, setResetPasswordFormModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<AdminUserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetPassError, setResetPassError] = useState('');

  // Delete states
  const [isDeleteUsersModalOpen, setDeleteUsersModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dashboard filter modals
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

  const fetchAllUsers = useCallback(async (page: number, sort: string, order: 'ASC' | 'DESC') => {
    setLoadingAllUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getAllUsers(itemsTake, skip, sort, order);
      setAllUsersList(response.items || []);
      setAllUsersTotal(response.total || 0);
    } finally { setLoadingAllUsers(false); }
  }, []);

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

  useEffect(() => { 
    if (isAllUsersModalOpen || isEditUsersListModalOpen || isDeleteUsersModalOpen || isResetPasswordListModalOpen) {
      fetchAllUsers(allUsersPage, allUsersSort, allUsersOrder); 
    }
  }, [isAllUsersModalOpen, isEditUsersListModalOpen, isDeleteUsersModalOpen, isResetPasswordListModalOpen, allUsersPage, allUsersSort, allUsersOrder, fetchAllUsers]);
  
  useEffect(() => { if (isUsersModalOpen) fetchUsers(usersPage); }, [isUsersModalOpen, usersPage, fetchUsers]);
  useEffect(() => { if (isUsersActiveModalOpen) fetchActiveUsers(activeUsersPage); }, [isUsersActiveModalOpen, activeUsersPage, fetchActiveUsers]);
  useEffect(() => { if (isUsersInactiveModalOpen) fetchInactiveUsers(inactiveUsersPage); }, [isUsersInactiveModalOpen, inactiveUsersPage, fetchInactiveUsers]);
  useEffect(() => { if (isQrActiveModalOpen) fetchQrActive(qrActivePage); }, [isQrActiveModalOpen, qrActivePage, fetchQrActive]);
  useEffect(() => { if (isQrInactiveModalOpen) fetchQrInactive(qrInactivePage); }, [isQrInactiveModalOpen, qrInactivePage, fetchQrInactive]);
  useEffect(() => { if (isUsersWithoutQrModalOpen) fetchUsersWithoutQr(usersWithoutQrPage); }, [isUsersWithoutQrModalOpen, usersWithoutQrPage, fetchUsersWithoutQr]);

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleWhatsAppRedirect = (phone: string | null | undefined) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleSortChange = (field: string) => {
    if (allUsersSort === field) {
      setAllUsersOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setAllUsersSort(field);
      setAllUsersOrder('ASC');
    }
    setAllUsersPage(1);
  };

  const handleOpenEditUserForm = async (user: AdminUserData) => {
    setUserToEdit(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    if (user.phone) {
      const p = user.phone.startsWith('55') ? user.phone.substring(2) : user.phone;
      setEditUserPhone(applyPhoneMask(p));
    } else {
      setEditUserPhone('');
    }
    try {
      const fullProfile = await authService.getUserProfile(user.id);
      if (fullProfile.dateOfBirth) {
        const [y, m, d] = fullProfile.dateOfBirth.split('-');
        setEditUserBirthDate(`${d}/${m}/${y}`);
      } else {
        setEditUserBirthDate('');
      }
    } catch {
      setEditUserBirthDate('');
    }
    setSaveUserError('');
    setEditUserDetailModalOpen(true);
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setSaveUserError('');
    setIsSavingUser(true);
    try {
      const payload: any = { name: editUserName.trim(), email: editUserEmail.trim() };
      if (editUserPhone) payload.phone = `55${editUserPhone.replace(/\D/g, '')}`;
      if (editUserBirthDate) {
        const [day, month, year] = editUserBirthDate.split('/');
        payload.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      await authService.updateUser(userToEdit.id, payload);
      setAllUsersList(prev => prev.map(u => u.id === userToEdit.id ? { ...u, ...payload } : u));
      setEditUserDetailModalOpen(false);
      if (showToast) showToast('Dados do usuário atualizados com sucesso!');
    } catch (err: any) {
      setSaveUserError(err.message || 'Erro ao salvar alterações.');
    } finally {
      setIsSavingUser(false);
    }
  };

  // --- RESET PASSWORD LOGIC ---
  const handleOpenResetForm = (user: AdminUserData) => {
    setUserToReset(user);
    setNewPassword('');
    setResetPassError('');
    setResetPasswordFormModalOpen(true);
  };

  const passwordValidations = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
  }), [newPassword]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReset || !isPasswordValid) return;

    setIsResetting(true);
    setResetPassError('');
    try {
      await authService.forceResetPassword(userToReset.id, newPassword);
      if (showToast) showToast(`Senha de ${userToReset.name.split(' ')[0]} redefinida com sucesso!`);
      setResetPasswordFormModalOpen(false);
      setResetPasswordListModalOpen(false);
      setUserToReset(null);
    } catch (err: any) {
      setResetPassError(err.message || 'Falha ao redefinir senha.');
    } finally {
      setIsResetting(false);
    }
  };

  const performSequentialDeletion = async () => {
    if (selectedUserIds.size === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedUserIds);
      for (const userId of idsToDelete) {
        await adminService.deleteUser(userId);
      }
      
      // Sucesso total
      setAllUsersList(prev => prev.filter(u => !selectedUserIds.has(u.id)));
      if (showToast) showToast(`${selectedUserIds.size} usuário(s) excluído(s) com sucesso!`);
      setSelectedUserIds(new Set());
      setConfirmDeleteModalOpen(false);
      setDeleteUsersModalOpen(false);
      // Atualizar o dashboard
      fetchData(startDate, endDate);
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Ocorreu um erro durante a exclusão.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const hourlyLabels = useMemo(() => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`), []);
  const revenueHourlySeries = useMemo(() => [{ label: 'Receita (R$)', data: [120, 80, 45, 20, 10, 5, 40, 150, 450, 890, 1200, 1500, 1800, 1600, 1400, 1300, 1250, 1600, 2100, 2400, 1900, 1500, 800, 300], color: '#10b981' }], []);
  const salesHourlySeries = useMemo(() => [{ label: 'Vendas (Unidades)', data: [3, 2, 1, 0, 0, 0, 1, 4, 10, 18, 25, 30, 35, 32, 28, 26, 25, 32, 42, 48, 38, 30, 16, 6], color: '#8b5cf6' }], []);

  const usersChartSeries = useMemo(() => {
    if (!data) return [];
    const gen = (val: number) => Array.from({ length: 7 }, (_, i) => Math.floor(val * (0.7 + (i * 0.05))));
    return [
      { label: 'Criados', data: gen(data.usersCreated), color: '#3b82f6' },
      { label: 'Ativos', data: gen(data.usersLoggedIn), color: '#10b981' },
      { label: 'Inativos', data: gen(data.usersInactive ?? 0), color: '#6b7280' },
      { label: 'Sem QR', data: gen(data.qrcodeNone), color: '#f59e0b' }
    ];
  }, [data]);

  const qrChartSeries = useMemo(() => {
    if (!data) return [];
    const gen = (val: number) => Array.from({ length: 7 }, (_, i) => Math.floor(val * (0.8 + (i * 0.033))));
    return [
      { label: 'Ativos', data: gen(data.qrcodeActive), color: '#2dd4bf' },
      { label: 'Expirados', data: gen(data.qrcodeExpired), color: '#ef4444' }
    ];
  }, [data]);

  const renderSortableHeader = (label: string, field: string) => {
    const isActive = allUsersSort === field;
    return (
      <th className={`px-4 py-3 cursor-pointer group hover:bg-muted transition-colors select-none ${isActive ? 'text-primary' : ''}`} onClick={() => handleSortChange(field)}>
        <div className="flex items-center gap-1">
          {label}
          <div className={`flex flex-col items-center opacity-30 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}>
            <svg className={`h-2.5 w-2.5 ${isActive && allUsersOrder === 'ASC' ? 'text-primary' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z" /></svg>
            <svg className={`h-2.5 w-2.5 ${isActive && allUsersOrder === 'DESC' ? 'text-primary' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z" /></svg>
          </div>
        </div>
      </th>
    );
  };

  const renderPagination = (page: number, total: number, setPage: React.Dispatch<React.SetStateAction<number>>, loading: boolean, currentListSize: number) => (
    <div className="flex items-center justify-between pt-2">
      <div className="text-xs text-muted-foreground">Mostrando <strong>{currentListSize}</strong> de <strong>{total}</strong> registros</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Anterior</Button>
        <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{page}</div>
        <Button variant="outline" size="sm" disabled={page * itemsTake >= total || loading} onClick={() => setPage(p => p + 1)}>Próximo</Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground">Estatísticas e gerenciamento de usuários em tempo real.</p>
      </div>
      <hr className="border-t border-border/40 my-6" />

      {!loading && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SimpleLineChart title="Receita (Últimas 24h)" series={revenueHourlySeries} labels={hourlyLabels} isCurrency={true} />
            <SimpleLineChart title="Volume de Vendas (Últimas 24h)" series={salesHourlySeries} labels={hourlyLabels} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SimpleLineChart title="Crescimento de Usuários" series={usersChartSeries} labels={dailyLabels} />
            <SimpleLineChart title="Status de QR Codes" series={qrChartSeries} labels={dailyLabels} />
          </div>
          <hr className="border-t border-border/40 my-8" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Carregando painel...</p>
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Usuários Criados" value={data.usersCreated} icon={<UserPlusIcon className="h-4 w-4" />} onClick={() => { setUsersPage(1); setUsersModalOpen(true); }} />
            <StatCard title="Ativos" value={data.usersLoggedIn} icon={<UserCheckIcon className="h-4 w-4" />} onClick={() => { setActiveUsersPage(1); setUsersActiveModalOpen(true); }} />
            <StatCard title="Inativos" value={data.usersInactive ?? 0} icon={<UsersIcon className="h-4 w-4" />} onClick={() => { setInactiveUsersPage(1); setUsersInactiveModalOpen(true); }} />
            <StatCard title="QR Codes Ativos" value={data.qrcodeActive} icon={<QrCodeIcon className="h-4 w-4" />} onClick={() => { setQrActivePage(1); setQrActiveModalOpen(true); }} />
            <StatCard title="Expirados" value={data.qrcodeExpired} icon={<ClockIcon className="h-4 w-4" />} onClick={() => { setQrInactivePage(1); setQrInactiveModalOpen(true); }} />
            <StatCard title="Sem QR Code" value={data.qrcodeNone} icon={<UserXIcon className="h-4 w-4" />} onClick={() => { setUsersWithoutQrPage(1); setUsersWithoutQrModalOpen(true); }} />
          </div>

          <hr className="border-t border-border/40 my-10" />

          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2"><UsersIcon className="h-5 w-5 text-primary" />Gerenciamento Geral de Usuários</CardTitle>
              <p className="text-sm text-muted-foreground">Realize ações administrativas diretamente na base de usuários cadastrados.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-primary/5 border-primary/20" onClick={() => { setAllUsersPage(1); setAllUsersModalOpen(true); }}><SearchIcon className="h-4 w-4" />Visualizar Usuários</Button>
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-primary/5 border-primary/20" onClick={() => { setAllUsersPage(1); setEditUsersListModalOpen(true); }}><PencilIcon className="h-4 w-4" />Editar Usuários</Button>
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-destructive/5 border-destructive/20 hover:text-destructive" onClick={() => { setAllUsersPage(1); setDeleteUsersModalOpen(true); }}><TrashIcon className="h-4 w-4" />Excluir Usuários</Button>
              <Button variant="outline" className="h-12 font-bold flex items-center gap-2 hover:bg-primary/5 border-primary/20" onClick={() => { setAllUsersPage(1); setResetPasswordListModalOpen(true); }}><KeyIcon className="h-4 w-4" />Redefinir Senha</Button>
            </CardContent>
          </Card>

          <hr className="border-t border-border/40 my-10" />

          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2"><FilterIcon className="h-5 w-5 text-primary" />Comunicação e Filtros CRM</CardTitle>
              <p className="text-sm text-muted-foreground">Segmente sua base de usuários para campanhas direcionadas e exportações.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Período de Cadastro</label>
                  <div className="flex gap-2">
                    <Input type="date" value={crmDateFrom} onChange={(e) => setCrmDateFrom(e.target.value)} className="text-xs" />
                    <Input type="date" value={crmDateTo} onChange={(e) => setCrmDateTo(e.target.value)} className="text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Período de Aniversário</label>
                  <div className="flex gap-2">
                    <Input type="date" value={crmBirthDateFrom} onChange={(e) => setCrmBirthDateFrom(e.target.value)} className="text-xs" />
                    <Input type="date" value={crmBirthDateTo} onChange={(e) => setCrmBirthDateTo(e.target.value)} className="text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status do Usuário</label>
                  <select value={crmStatus} onChange={(e) => setCrmStatus(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs">
                    <option value="both">Ativos e Inativos</option>
                    <option value="active">Somente Ativos</option>
                    <option value="inactive">Somente Inativos</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button variant="outline" className="font-bold flex items-center gap-2 hover:bg-primary/5" onClick={() => { }}><DownloadIcon className="h-4 w-4" />Exportar Listagem</Button>
                <Button className="font-bold flex items-center gap-2" onClick={() => { }}><SendIcon className="h-4 w-4" />Iniciar Comunicação</Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Dialog isOpen={isAllUsersModalOpen} onClose={() => setAllUsersModalOpen(false)} title="Todos os Usuários Cadastrados" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  {renderSortableHeader('Criado em', 'createdAt')}
                  {renderSortableHeader('Nome', 'name')}
                  {renderSortableHeader('Phone', 'phone')}
                  {renderSortableHeader('Email', 'email')}
                  {renderSortableHeader('Tipo', 'userType')}
                  {renderSortableHeader('Último Login', 'lastLogin')}
                  <th className="px-4 py-3 text-center">Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingAllUsers ? (<tr><td colSpan={8} className="px-4 py-10 text-center">Carregando usuários...</td></tr>) : allUsersList.map(user => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedUserIds.has(user.id)} readOnly /></td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(user.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">{user.userType || 'user'}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(user.lastLogin)}</td>
                    <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(allUsersPage, allUsersTotal, setAllUsersPage, loadingAllUsers, allUsersList.length)}
        </div>
      </Dialog>

      <Dialog isOpen={isEditUsersListModalOpen} onClose={() => setEditUsersListModalOpen(false)} title="Selecione um Usuário para Editar" size="xl">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground -mt-2">Clique em uma linha para editar os dados do usuário.</p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSortableHeader('Criado em', 'createdAt')}
                  {renderSortableHeader('Nome', 'name')}
                  {renderSortableHeader('Telefone', 'phone')}
                  {renderSortableHeader('Email', 'email')}
                  {renderSortableHeader('Último Login', 'lastLogin')}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingAllUsers ? (<tr><td colSpan={5} className="px-4 py-10 text-center">Carregando usuários...</td></tr>) : allUsersList.map(user => (
                  <tr key={user.id} className="hover:bg-accent transition-colors cursor-pointer group" onClick={() => handleOpenEditUserForm(user)}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(user.createdAt)}</td>
                    <td className="px-4 py-3 font-medium flex items-center justify-between">{user.name}<PencilIcon className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(user.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(allUsersPage, allUsersTotal, setAllUsersPage, loadingAllUsers, allUsersList.length)}
        </div>
      </Dialog>

      {/* MODAL: Redefinir Senha (Listagem) */}
      <Dialog 
        isOpen={isResetPasswordListModalOpen} 
        onClose={() => setResetPasswordListModalOpen(false)} 
        title="Redefinir Senha de Usuário" 
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground -mt-2">Selecione o usuário que terá a senha redefinida clicando na linha correspondente.</p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSortableHeader('Criado em', 'createdAt')}
                  {renderSortableHeader('Nome', 'name')}
                  {renderSortableHeader('Telefone', 'phone')}
                  {renderSortableHeader('Email', 'email')}
                  {renderSortableHeader('Tipo', 'userType')}
                  {renderSortableHeader('Último Login', 'lastLogin')}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingAllUsers ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center">Carregando base de usuários...</td></tr>
                ) : allUsersList.map(user => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-accent transition-colors cursor-pointer group" 
                    onClick={() => handleOpenResetForm(user)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(user.createdAt)}</td>
                    <td className="px-4 py-3 font-medium flex items-center justify-between">
                        {user.name}
                        <KeyIcon className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                        {user.userType || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(user.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(allUsersPage, allUsersTotal, setAllUsersPage, loadingAllUsers, allUsersList.length)}
        </div>
      </Dialog>

      {/* MODAL: Formulário de Nova Senha Administrativo */}
      <Dialog
        isOpen={isResetPasswordFormModalOpen}
        onClose={() => setResetPasswordFormModalOpen(false)}
        title={`Nova Senha para ${userToReset?.name.split(' ')[0] || ''}`}
        size="md"
      >
        <form onSubmit={handleConfirmResetPassword} className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-sm font-medium">Você está definindo uma nova senha para o acesso:</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{userToReset?.email}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Nova Senha de Acesso</label>
            <Input 
              type="password"
              placeholder="Digite a nova senha de segurança" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              disabled={isResetting}
              className="h-12"
            />
            <div className="text-[10px] grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-muted-foreground">
              <div className={passwordValidations.minLength ? 'text-green-600 font-bold' : ''}>• Mín. 8 caracteres</div>
              <div className={passwordValidations.hasUpper ? 'text-green-600 font-bold' : ''}>• Uma letra maiúscula</div>
              <div className={passwordValidations.hasLower ? 'text-green-600 font-bold' : ''}>• Uma letra minúscula</div>
              <div className={passwordValidations.hasNumber ? 'text-green-600 font-bold' : ''}>• Um número</div>
            </div>
          </div>

          {resetPassError && <div className="p-3 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg border border-destructive/20">{resetPassError}</div>}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => setResetPasswordFormModalOpen(false)}
              disabled={isResetting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 font-bold shadow-lg shadow-primary/20" 
              disabled={isResetting || !isPasswordValid}
            >
              {isResetting ? 'Processando...' : 'Confirmar Nova Senha'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: Excluir Usuários (Listagem) */}
      <Dialog 
        isOpen={isDeleteUsersModalOpen} 
        onClose={() => { setDeleteUsersModalOpen(false); setSelectedUserIds(new Set()); }} 
        title="Excluir Usuários" 
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground -mt-2">Selecione um ou mais usuários para exclusão definitiva.</p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  {renderSortableHeader('Criado em', 'createdAt')}
                  {renderSortableHeader('Nome', 'name')}
                  {renderSortableHeader('Telefone', 'phone')}
                  {renderSortableHeader('Email', 'email')}
                  {renderSortableHeader('Tipo', 'userType')}
                  {renderSortableHeader('Último Login', 'lastLogin')}
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingAllUsers ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center">Carregando base de usuários...</td></tr>
                ) : allUsersList.map(user => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-destructive/5 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-destructive/5' : ''}`} 
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive cursor-pointer"
                        checked={selectedUserIds.has(user.id)} 
                        onChange={() => {}} 
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(user.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                        {user.userType || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(user.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            {renderPagination(allUsersPage, allUsersTotal, setAllUsersPage, loadingAllUsers, allUsersList.length)}
            <Button 
              variant="destructive" 
              className="h-11 px-6 font-bold shadow-lg"
              disabled={selectedUserIds.size === 0}
              onClick={() => setConfirmDeleteModalOpen(true)}
            >
              Excluir Selecionados ({selectedUserIds.size})
            </Button>
          </div>
        </div>
      </Dialog>

      {/* MODAL: Confirmação de Exclusão */}
      <Dialog
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setConfirmDeleteModalOpen(false)}
        title="Confirmar Exclusão Definitiva"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex gap-3">
            <AlertTriangleIcon className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <p className="font-bold text-destructive">Atenção!</p>
              <p className="text-sm">Você está prestes a excluir <span className="font-black">{selectedUserIds.size}</span> usuário(s) do sistema.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta ação é <strong>irreversível</strong>. Todos os dados pessoais, acessos e QR Codes vinculados a estes usuários serão removidos permanentemente da plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => setConfirmDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Manter usuários
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-12 font-bold shadow-xl shadow-destructive/20"
              onClick={performSequentialDeletion}
              disabled={isDeleting}
            >
              {isDeleting ? 'Processando...' : 'Sim, excluir permanentemente'}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={isEditUserDetailModalOpen} onClose={() => setEditUserDetailModalOpen(false)} title={`Editando Usuário: ${userToEdit?.name.split(' ')[0] || ''}`} size="md">
        <form onSubmit={handleSaveUserEdit} className="space-y-5">
          <div className="space-y-2"><label className="text-xs font-black uppercase text-muted-foreground">Nome Completo</label><Input value={editUserName} onChange={e => setEditUserName(e.target.value)} required disabled={isSavingUser} /></div>
          <div className="space-y-2"><label className="text-xs font-black uppercase text-muted-foreground">E-mail</label><Input type="email" value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} required disabled={isSavingUser} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-xs font-black uppercase text-muted-foreground">Telefone</label><Input value={editUserPhone} onChange={e => setEditUserPhone(applyPhoneMask(e.target.value))} disabled={isSavingUser} /></div>
            <div className="space-y-2"><label className="text-xs font-black uppercase text-muted-foreground">Nascimento</label><Input value={editUserBirthDate} onChange={e => setEditUserBirthDate(applyBirthDateMask(e.target.value))} disabled={isSavingUser} /></div>
          </div>
          {saveUserError && <div className="p-3 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg">{saveUserError}</div>}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setEditUserDetailModalOpen(false)} disabled={isSavingUser}>Cancelar</Button>
            <Button type="submit" className="flex-1 h-12 font-bold" disabled={isSavingUser}>{isSavingUser ? 'Salvando...' : 'Salvar Alterações'}</Button>
          </div>
        </form>
      </Dialog>

      {/* Reutilizando as listagens para os demais filtros do Dashboard */}
      <Dialog isOpen={isUsersModalOpen} onClose={() => setUsersModalOpen(false)} title="Usuários Criados no Período" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">{usersList.map(user => (<tr key={user.id} className="hover:bg-accent/30 transition-colors"><td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => handleWhatsAppRedirect(user.phone)}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td></tr>))}</tbody>
            </table>
          </div>
          {renderPagination(usersPage, usersTotal, setUsersPage, loadingUsers, usersList.length)}
        </div>
      </Dialog>

      <Dialog isOpen={isUsersActiveModalOpen} onClose={() => setUsersActiveModalOpen(false)} title="Usuários Ativos" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">Último Acesso</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">{activeUsersList.map(user => (<tr key={user.id} className="hover:bg-accent/30 transition-colors"><td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center">{formatDateTime(user.lastLogin)}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => handleWhatsAppRedirect(user.phone)}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td></tr>))}</tbody>
            </table>
          </div>
          {renderPagination(activeUsersPage, activeUsersTotal, setActiveUsersPage, loadingActiveUsers, activeUsersList.length)}
        </div>
      </Dialog>

      <Dialog isOpen={isUsersInactiveModalOpen} onClose={() => setUsersInactiveModalOpen(false)} title="Usuários Inativos" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">{inactiveUsersList.map(user => (<tr key={user.id} className="hover:bg-accent/30 transition-colors"><td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => handleWhatsAppRedirect(user.phone)}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td></tr>))}</tbody>
            </table>
          </div>
          {renderPagination(inactiveUsersPage, inactiveUsersTotal, setInactiveUsersPage, loadingInactiveUsers, inactiveUsersList.length)}
        </div>
      </Dialog>

      <Dialog isOpen={isQrActiveModalOpen} onClose={() => setQrActiveModalOpen(false)} title="QR Codes Ativos" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr><th className="px-4 py-3">Evento</th><th className="px-4 py-3">Dono</th><th className="px-4 py-3">Expiração</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">{qrActiveList.map(qr => (<tr key={qr.id} className="hover:bg-accent/30 transition-colors"><td className="px-4 py-3 font-medium">{qr.eventName}</td><td className="px-4 py-3">{qr.user.name}</td><td className="px-4 py-3">{formatDateOnly(qr.expirationDate)}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => handleWhatsAppRedirect(qr.user.phone)}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td></tr>))}</tbody>
            </table>
          </div>
          {renderPagination(qrActivePage, qrActiveTotal, setQrActivePage, loadingQrActive, qrActiveList.length)}
        </div>
      </Dialog>

      <Dialog isOpen={isQrInactiveModalOpen} onClose={() => setQrInactiveModalOpen(false)} title="QR Codes Expirados" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr><th className="px-4 py-3">Evento</th><th className="px-4 py-3">Dono</th><th className="px-4 py-3">Expirou em</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">{qrInactiveList.map(qr => (<tr key={qr.id} className="hover:bg-accent/30 transition-colors"><td className="px-4 py-3 font-medium">{qr.eventName}</td><td className="px-4 py-3">{qr.user.name}</td><td className="px-4 py-3">{formatDateOnly(qr.expirationDate)}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => handleWhatsAppRedirect(qr.user.phone)}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td></tr>))}</tbody>
            </table>
          </div>
          {renderPagination(qrInactivePage, qrInactiveTotal, setQrInactivePage, loadingQrInactive, qrInactiveList.length)}
        </div>
      </Dialog>

      <Dialog isOpen={isUsersWithoutQrModalOpen} onClose={() => setUsersWithoutQrModalOpen(false)} title="Usuários sem QR Code" size="xl">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">CONVERSAR</th></tr>
              </thead>
              <tbody className="divide-y">{usersWithoutQrList.map(user => (<tr key={user.id} className="hover:bg-accent/30 transition-colors"><td className="px-4 py-3 font-medium">{user.name}</td><td className="px-4 py-3">{formatDisplayPhone(user.phone)}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" onClick={() => handleWhatsAppRedirect(user.phone)}><MessageCircleIcon className="h-5 w-5 text-green-600" /></Button></td></tr>))}</tbody>
            </table>
          </div>
          {renderPagination(usersWithoutQrPage, usersWithoutQrTotal, setUsersWithoutQrPage, loadingUsersWithoutQr, usersWithoutQrList.length)}
        </div>
      </Dialog>

      {selectedUserIds.size > 0 && !isDeleteUsersModalOpen && (
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
