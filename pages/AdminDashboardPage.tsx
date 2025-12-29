
import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AdminDashboardData, AdminUserData, AdminQRCodeData } from '../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import { UserPlusIcon, UserCheckIcon, QrCodeIcon, ClockIcon, UserXIcon, UsersIcon, MessageCircleIcon } from '../components/icons';

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
      if (new Date(start) > new Date(end)) {
        setError('A data inicial não pode ser maior que a data final.');
        setLoading(false);
        return;
      }
      const fromDateStr = `${start}T00:00:00-03:00`;
      const toDateStr = `${end}T23:59:59-03:00`;
      const result = await adminService.getDashboardData(fromDateStr, toDateStr);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar os dados do painel.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page: number) => {
    setLoadingUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getCreatedUsers(itemsTake, skip);
      setUsersList(response.items || []);
      setUsersTotal(response.total || 0);
    } catch (err: any) {
      console.error("Erro ao buscar usuários criados:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchActiveUsers = useCallback(async (page: number) => {
    setLoadingActiveUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getActiveUsers(itemsTake, skip);
      setActiveUsersList(response.items || []);
      setActiveUsersTotal(response.total || 0);
    } catch (err: any) {
      console.error("Erro ao buscar usuários ativos:", err);
    } finally {
      setLoadingActiveUsers(false);
    }
  }, []);

  const fetchInactiveUsers = useCallback(async (page: number) => {
    setLoadingInactiveUsers(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getInactiveUsers(itemsTake, skip);
      setInactiveUsersList(response.items || []);
      setInactiveUsersTotal(response.total || 0);
    } catch (err: any) {
      console.error("Erro ao buscar usuários inativos:", err);
    } finally {
      setLoadingInactiveUsers(false);
    }
  }, []);

  const fetchQrActive = useCallback(async (page: number) => {
    setLoadingQrActive(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getQRCodesByStatus('active', itemsTake, skip);
      setQrActiveList(response.items || []);
      setQrActiveTotal(response.total || 0);
    } catch (err: any) {
      console.error("Erro ao buscar QR codes ativos:", err);
    } finally {
      setLoadingQrActive(false);
    }
  }, []);

  const fetchQrInactive = useCallback(async (page: number) => {
    setLoadingQrInactive(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getQRCodesByStatus('inactive', itemsTake, skip);
      setQrInactiveList(response.items || []);
      setQrInactiveTotal(response.total || 0);
    } catch (err: any) {
      console.error("Erro ao buscar QR codes inativos:", err);
    } finally {
      setLoadingQrInactive(false);
    }
  }, []);

  const fetchUsersWithoutQr = useCallback(async (page: number) => {
    setLoadingUsersWithoutQr(true);
    try {
      const skip = (page - 1) * itemsTake;
      const response = await adminService.getUsersWithoutQRCodes(itemsTake, skip);
      setUsersWithoutQrList(response.items || []);
      setUsersWithoutQrTotal(response.total || 0);
    } catch (err: any) {
      console.error("Erro ao buscar usuários sem QR code:", err);
    } finally {
      setLoadingUsersWithoutQr(false);
    }
  }, []);

  useEffect(() => {
    fetchData(startDate, endDate);
  }, []);

  useEffect(() => {
    if (isUsersModalOpen) fetchUsers(usersPage);
  }, [isUsersModalOpen, usersPage, fetchUsers]);

  useEffect(() => {
    if (isUsersActiveModalOpen) fetchActiveUsers(activeUsersPage);
  }, [isUsersActiveModalOpen, activeUsersPage, fetchActiveUsers]);

  useEffect(() => {
    if (isUsersInactiveModalOpen) fetchInactiveUsers(inactiveUsersPage);
  }, [isUsersInactiveModalOpen, inactiveUsersPage, fetchInactiveUsers]);

  useEffect(() => {
    if (isQrActiveModalOpen) fetchQrActive(qrActivePage);
  }, [isQrActiveModalOpen, qrActivePage, fetchQrActive]);

  useEffect(() => {
    if (isQrInactiveModalOpen) fetchQrInactive(qrInactivePage);
  }, [isQrInactiveModalOpen, qrInactivePage, fetchQrInactive]);

  useEffect(() => {
    if (isUsersWithoutQrModalOpen) fetchUsersWithoutQr(usersWithoutQrPage);
  }, [isUsersWithoutQrModalOpen, usersWithoutQrPage, fetchUsersWithoutQr]);

  useEffect(() => {
    if (!isUsersModalOpen && !isUsersActiveModalOpen && !isUsersInactiveModalOpen && !isQrActiveModalOpen && !isQrInactiveModalOpen && !isUsersWithoutQrModalOpen) {
      setSelectedUserIds(new Set());
    }
  }, [isUsersModalOpen, isUsersActiveModalOpen, isUsersInactiveModalOpen, isQrActiveModalOpen, isQrInactiveModalOpen, isUsersWithoutQrModalOpen]);

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (list: (AdminUserData | AdminQRCodeData)[]) => {
    const ids = list.map(item => 'user' in item ? item.user.id : item.id);
    const allOnPageSelected = ids.every(id => selectedUserIds.has(id));
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleFilter = () => {
    fetchData(startDate, endDate);
  };

  const handleWhatsAppRedirect = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

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

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral das estatísticas do sistema.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 pt-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:w-auto space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium">Data Inicial</label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={getLocalDateString(new Date())}
            />
          </div>
          <div className="flex-1 w-full sm:w-auto space-y-2">
            <label htmlFor="end-date" className="text-sm font-medium">Data Final</label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={getLocalDateString(new Date())}
            />
          </div>
          <div className="pt-0 sm:pt-6 w-full sm:w-auto">
             <Button onClick={handleFilter} disabled={loading} className="w-full">
                {loading ? 'Filtrando...' : 'Filtrar'}
             </Button>
          </div>
        </CardContent>
      </Card>
      
      {error && <p className="text-center text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="text-center py-16">Carregando dados...</div>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Usuários Criados" 
              value={data.usersCreated} 
              icon={<UserPlusIcon className="h-4 w-4" />} 
              onClick={() => { setUsersPage(1); setUsersModalOpen(true); }}
            />
            <StatCard 
              title="Usuários Ativos" 
              value={data.usersLoggedIn} 
              icon={<UserCheckIcon className="h-4 w-4" />} 
              onClick={() => { setActiveUsersPage(1); setUsersActiveModalOpen(true); }}
            />
            <StatCard 
              title="Usuários Inativos" 
              value={data.usersInactive ?? 0} 
              icon={<UsersIcon className="h-4 w-4" />} 
              onClick={() => { setInactiveUsersPage(1); setUsersInactiveModalOpen(true); }}
            />
            
            <StatCard 
              title="QR Codes Ativos" 
              value={data.qrcodeActive} 
              icon={<QrCodeIcon className="h-4 w-4" />} 
              onClick={() => { setQrActivePage(1); setQrActiveModalOpen(true); }}
            />
            <StatCard 
              title="QR Codes Expirados" 
              value={data.qrcodeExpired} 
              icon={<ClockIcon className="h-4 w-4" />} 
              onClick={() => { setQrInactivePage(1); setQrInactiveModalOpen(true); }}
            />
            <StatCard 
              title="Usuários sem QR Code" 
              value={data.qrcodeNone} 
              icon={<UserXIcon className="h-4 w-4" />} 
              onClick={() => { setUsersWithoutQrPage(1); setUsersWithoutQrModalOpen(true); }}
            />
        </div>
      ) : !error ? (
        <div className="text-center py-16 text-muted-foreground">Nenhum dado para exibir.</div>
      ) : null}

      <Dialog
        isOpen={isUsersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        title="Usuários Criados"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSelectAllHeader(usersList)}
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Já acessou</th>
                  <th className="px-4 py-3 text-center">CONVERSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando usuários...</td>
                  </tr>
                ) : usersList.length > 0 ? (
                  usersList.map(user => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-accent/30 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      {renderSelectionCell(user.id)}
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 text-center text-lg">
                        {user.lastLogin ? '✅' : '❌'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}
                        >
                          <MessageCircleIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{usersList.length}</strong> de <strong>{usersTotal}</strong> usuários
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={usersPage === 1 || loadingUsers} onClick={() => setUsersPage(p => p - 1)}>Anterior</Button>
              <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{usersPage}</div>
              <Button variant="outline" size="sm" disabled={usersPage * itemsTake >= usersTotal || loadingUsers} onClick={() => setUsersPage(p => p + 1)}>Próximo</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isUsersActiveModalOpen}
        onClose={() => setUsersActiveModalOpen(false)}
        title="Usuários Ativos"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSelectAllHeader(activeUsersList)}
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Último Acesso</th>
                  <th className="px-4 py-3 text-center">CONVERSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingActiveUsers ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando usuários ativos...</td>
                  </tr>
                ) : activeUsersList.length > 0 ? (
                  activeUsersList.map(user => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-accent/30 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      {renderSelectionCell(user.id)}
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{formatDateTime(user.lastLogin)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}>
                          <MessageCircleIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário ativo encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{activeUsersList.length}</strong> de <strong>{activeUsersTotal}</strong> usuários
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={activeUsersPage === 1 || loadingActiveUsers} onClick={() => setActiveUsersPage(p => p - 1)}>Anterior</Button>
              <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{activeUsersPage}</div>
              <Button variant="outline" size="sm" disabled={activeUsersPage * itemsTake >= activeUsersTotal || loadingActiveUsers} onClick={() => setActiveUsersPage(p => p + 1)}>Próximo</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isUsersInactiveModalOpen}
        onClose={() => setUsersInactiveModalOpen(false)}
        title="Usuários Inativos"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSelectAllHeader(inactiveUsersList)}
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Último Acesso</th>
                  <th className="px-4 py-3 text-center">CONVERSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingInactiveUsers ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando usuários inativos...</td>
                  </tr>
                ) : inactiveUsersList.length > 0 ? (
                  inactiveUsersList.map(user => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-accent/30 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      {renderSelectionCell(user.id)}
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{formatDateTime(user.lastLogin)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}>
                          <MessageCircleIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário inativo encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{inactiveUsersList.length}</strong> de <strong>{inactiveUsersTotal}</strong> usuários
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={inactiveUsersPage === 1 || loadingInactiveUsers} onClick={() => setInactiveUsersPage(p => p - 1)}>Anterior</Button>
              <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{inactiveUsersPage}</div>
              <Button variant="outline" size="sm" disabled={inactiveUsersPage * itemsTake >= inactiveUsersTotal || loadingInactiveUsers} onClick={() => setInactiveUsersPage(p => p + 1)}>Próximo</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isQrActiveModalOpen}
        onClose={() => setQrActiveModalOpen(false)}
        title="QR Codes Ativos"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSelectAllHeader(qrActiveList)}
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Expiração</th>
                  <th className="px-4 py-3 text-center">CONVERSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingQrActive ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Carregando QR codes ativos...</td>
                  </tr>
                ) : qrActiveList.length > 0 ? (
                  qrActiveList.map(qr => (
                    <tr 
                      key={qr.id} 
                      className={`hover:bg-accent/30 transition-colors cursor-pointer ${selectedUserIds.has(qr.user.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => toggleUserSelection(qr.user.id)}
                    >
                      {renderSelectionCell(qr.user.id)}
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{qr.eventName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{qr.user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(qr.expirationDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(qr.user.phone); }}>
                          <MessageCircleIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum QR code ativo encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{qrActiveList.length}</strong> de <strong>{qrActiveTotal}</strong> registros
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={qrActivePage === 1 || loadingQrActive} onClick={() => setQrActivePage(p => p - 1)}>Anterior</Button>
              <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{qrActivePage}</div>
              <Button variant="outline" size="sm" disabled={qrActivePage * itemsTake >= qrActiveTotal || loadingQrActive} onClick={() => setQrActivePage(p => p + 1)}>Próximo</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isQrInactiveModalOpen}
        onClose={() => setQrInactiveModalOpen(false)}
        title="QR Codes Inativos"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSelectAllHeader(qrInactiveList)}
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Expiração</th>
                  <th className="px-4 py-3 text-center">CONVERSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingQrInactive ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Carregando QR codes inativos...</td>
                  </tr>
                ) : qrInactiveList.length > 0 ? (
                  qrInactiveList.map(qr => (
                    <tr 
                      key={qr.id} 
                      className={`hover:bg-accent/30 transition-colors cursor-pointer ${selectedUserIds.has(qr.user.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => toggleUserSelection(qr.user.id)}
                    >
                      {renderSelectionCell(qr.user.id)}
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{qr.eventName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{qr.user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(qr.expirationDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(qr.user.phone); }}>
                          <MessageCircleIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum QR code inativo encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{qrInactiveList.length}</strong> de <strong>{qrInactiveTotal}</strong> registros
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={qrInactivePage === 1 || loadingQrInactive} onClick={() => setQrInactivePage(p => p - 1)}>Anterior</Button>
              <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{qrInactivePage}</div>
              <Button variant="outline" size="sm" disabled={qrInactivePage * itemsTake >= qrInactiveTotal || loadingQrInactive} onClick={() => setQrInactivePage(p => p + 1)}>Próximo</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isUsersWithoutQrModalOpen}
        onClose={() => setUsersWithoutQrModalOpen(false)}
        title="Usuários sem QR Code"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium border-b">
                <tr>
                  {renderSelectAllHeader(usersWithoutQrList)}
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Já acessou</th>
                  <th className="px-4 py-3 text-center">CONVERSAR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingUsersWithoutQr ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando usuários...</td>
                  </tr>
                ) : usersWithoutQrList.length > 0 ? (
                  usersWithoutQrList.map(user => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-accent/30 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      {renderSelectionCell(user.id)}
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDisplayPhone(user.phone)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 text-center text-lg">
                        {user.lastLogin ? '✅' : '❌'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => { e.stopPropagation(); handleWhatsAppRedirect(user.phone); }}
                        >
                          <MessageCircleIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário sem QR code encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{usersWithoutQrList.length}</strong> de <strong>{usersWithoutQrTotal}</strong> usuários
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={usersWithoutQrPage === 1 || loadingUsersWithoutQr} onClick={() => setUsersWithoutQrPage(p => p - 1)}>Anterior</Button>
              <div className="flex items-center px-4 text-sm font-semibold bg-muted rounded-md border">{usersWithoutQrPage}</div>
              <Button variant="outline" size="sm" disabled={usersWithoutQrPage * itemsTake >= usersWithoutQrTotal || loadingUsersWithoutQr} onClick={() => setUsersWithoutQrPage(p => p + 1)}>Próximo</Button>
            </div>
          </div>
        </div>
      </Dialog>

      {selectedUserIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 ring-1 ring-black/5">
            <div className="flex flex-col border-r pr-6 border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selecionados</span>
              <span className="text-sm font-black text-primary">{selectedUserIds.size} {selectedUserIds.size === 1 ? 'usuário' : 'usuários'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full font-semibold border-primary/20 hover:bg-primary/5" 
                disabled
              >
                Criar comunicação
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full font-semibold border-primary/20 hover:bg-primary/5" 
                disabled
              >
                Exportar
              </Button>
              <button 
                onClick={() => setSelectedUserIds(new Set())}
                className="ml-2 p-1 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
