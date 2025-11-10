"use client"; 

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "src/app/lib/api"; 
import { useAuthStore } from "src/app/lib/store/auth.store";
import { PERMISSIONS } from "src/app/lib/constants"; 

type Role = { id: string; name: string; };
type User = { id: string; fullName: string; email: string; roles: { role: Role }[]; };
const fetchUsers = async (): Promise<User[]> => { const { data } = await api.get('/users'); return data; };
const fetchRoles = async (): Promise<Role[]> => { const { data } = await api.get('/roles'); return data; };

export default function UserManager() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const currentUserId = useAuthStore((state) => state.user?.id);
  const userPermissions = useAuthStore((state) => state.user?.permissions); 
  
  const canAssignRole = userPermissions?.includes(PERMISSIONS.USERS.ASSIGN_ROLE);
  const canDeleteUser = userPermissions?.includes(PERMISSIONS.USERS.DELETE);

  // =================================================================
  // --- ÇÖZÜM BURADA (SORGULARI BEKLET) ---
  // =================================================================
  
  // 1. TÜM KULLANICILARI ÇEK
  const { 
    data: users, 
    isLoading: isLoadingUsers,
    error: usersError 
  } = useQuery<User[]>({ 
    queryKey: ['users'], 
    queryFn: fetchUsers,
    // Bu sorguyu SADECE 'userPermissions' yüklendiyse
    // VE kullanıcının 'users:read' yetkisi varsa çalıştır.
    enabled: !!userPermissions && userPermissions.includes(PERMISSIONS.USERS.READ), 
  });
  
  // 2. TÜM ROLLERİ ÇEK
  const { 
    data: allRoles, 
    isLoading: isLoadingRoles 
  } = useQuery<Role[]>({ 
    queryKey: ['roles'], 
    queryFn: fetchRoles,
    // Bu sorguyu SADECE 'userPermissions' yüklendiyse
    // VE kullanıcının 'users:assign_role' yetkisi varsa çalıştır
    // (Modal'ı açmak için bu yetki lazım)
    enabled: !!userPermissions && userPermissions.includes(PERMISSIONS.USERS.ASSIGN_ROLE),
  });
  
  // =================================================================
  // --- ÇÖZÜM BİTTİ ---
  // =================================================================

  const deleteUserMutation = useMutation({ mutationFn: (userId: string) => api.delete(`/users/${userId}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); } });
  const handleDeleteUser = (user: User) => { if (window.confirm(`'${user.fullName}' (${user.email}) adlı kullanıcıyı silmek istediğinize emin misiniz?`)) { deleteUserMutation.mutate(user.id); } };

  return (
    <>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-blue-300">Kullanıcı Yönetimi</h2>
        
        {isLoadingUsers && <p className="mt-4 text-yellow-400">Kullanıcılar yükleniyor...</p>}
        {usersError && <p className="mt-4 text-red-500">Kullanıcıları listeleme yetkiniz yok veya bir hata oluştu.</p>}
        
        {/* Kullanıcı listesini (tablo) SADECE 'users' verisi varsa göster */}
        {users && (
          <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Ad Soyad</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">E-posta</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Mevcut Roller</th>
                        {(canAssignRole || canDeleteUser) && (
                          <th scope="col" className="relative px-6 py-3"><span className="sr-only">Eylemler</span></th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-900">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{user.fullName}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{user.email}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {user.roles.length > 0 ? user.roles.map(r => r.role.name).join(', ') : 'Rolü Yok'}
                          </td>
                          {(canAssignRole || canDeleteUser) && (
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-4">
                              {canAssignRole && (
                                <button onClick={() => setEditingUser(user)} className="text-blue-500 hover:text-blue-400">
                                  Rolleri Düzenle
                                </button>
                              )}
                              {canDeleteUser && user.id !== currentUserId && (
                                <button onClick={() => handleDeleteUser(user)} disabled={deleteUserMutation.isPending && deleteUserMutation.variables === user.id} className="text-red-500 hover:text-red-400 disabled:opacity-50">
                                  {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? 'Siliniyor...' : 'Sil'}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rol Atama Modal'ı */}
      {editingUser && (
        <EditUserRolesModal
          user={editingUser}
          allRoles={allRoles || []}
          isLoading={isLoadingRoles}
          onClose={() => setEditingUser(null)}
        />
      )}
    </>
  );
}

// ... (EditUserRolesModal component'i aynı) ...
function EditUserRolesModal({ user, allRoles, isLoading, onClose }: { user: User; allRoles: Role[]; isLoading: boolean; onClose: () => void; }) { /* ... (içerik aynı) ... */ }