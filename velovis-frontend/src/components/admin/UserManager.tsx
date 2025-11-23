"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "src/app/lib/api"; 
import { useAuthStore } from "src/app/lib/store/auth.store";
import { PERMISSIONS } from "src/app/lib/constants"; 
import { PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Tip Tanımları (Aynı)
type Role = { id: string; name: string; };
type User = { id: string; fullName: string; email: string; roles: { role: Role }[]; };

const fetchUsers = async (): Promise<User[]> => { const { data } = await api.get('/users'); return data; };
const fetchRoles = async (): Promise<Role[]> => { const { data } = await api.get('/roles'); return data; };

export default function UserManager() {
  const queryClient = useQueryClient();
  
  // Düzenleme State'leri (Basitleştirilmiş, Modal yerine inline düzenleme)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // ID listesi

  const currentUserId = useAuthStore((state) => state.user?.id);
  const userPermissions = useAuthStore((state) => state.user?.permissions); 
  
  const canAssignRole = userPermissions?.includes(PERMISSIONS.USERS.ASSIGN_ROLE);
  const canDeleteUser = userPermissions?.includes(PERMISSIONS.USERS.DELETE);

  // --- SORGULAR ---
  const { 
    data: users, 
    isLoading: isLoadingUsers,
    error: usersError 
  } = useQuery<User[]>({ 
    queryKey: ['users'], 
    queryFn: fetchUsers,
    enabled: !!userPermissions && userPermissions.includes(PERMISSIONS.USERS.READ), 
  });
  
  const { data: allRoles } = useQuery<Role[]>({ 
    queryKey: ['roles'], 
    queryFn: fetchRoles,
    enabled: !!userPermissions && userPermissions.includes(PERMISSIONS.USERS.ASSIGN_ROLE),
  });

  // --- FONKSİYONLAR ---
  
  // Düzenlemeyi Başlat
  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    // Kullanıcının mevcut rollerinin ID'lerini al
    setSelectedRoles(user.roles.map(r => r.role.id));
  };

  // Rol Seçimi (Checkbox Mantığı)
  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  // Kaydet (Mutation)
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: string, roleIds: string[] }) => {
       // Backend endpointine göre burası değişebilir. Genelde array gönderilir.
       return api.patch(`/users/${userId}/roles`, { roles: roleIds }); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUserId(null);
    }
  });

  const handleSaveRoles = (userId: string) => {
    updateRolesMutation.mutate({ userId, roleIds: selectedRoles });
  };

  // Silme
  const deleteUserMutation = useMutation({ 
    mutationFn: (userId: string) => api.delete(`/users/${userId}`), 
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); } 
  });
  
  const handleDeleteUser = (user: User) => { 
    if (window.confirm(`'${user.fullName}' adlı kullanıcıyı silmek istediğinize emin misiniz?`)) { 
      deleteUserMutation.mutate(user.id); 
    } 
  };

  if (isLoadingUsers) return <div className="text-xs text-zinc-500 animate-pulse">Yükleniyor...</div>;
  if (usersError) return <div className="text-xs text-red-500">Yetki yok veya hata oluştu.</div>;

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left table-fixed"> {/* table-fixed: Sütun genişliklerini sabitler */}
        
        <thead>
          <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest">
            <th className="py-3 font-bold w-1/4">Ad Soyad</th>
            <th className="py-3 font-bold w-1/3">E-Posta</th>
            <th className="py-3 font-bold w-1/3">Roller</th>
            {(canAssignRole || canDeleteUser) && (
              <th className="py-3 font-bold text-right w-[80px]">İşlem</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800/50">
          {users?.map(user => (
            <tr key={user.id} className="group hover:bg-zinc-900/30 transition-colors text-xs">
              
              {/* 1. AD SOYAD */}
              <td className="py-3 pr-2 font-medium text-white truncate" title={user.fullName}>
                {user.fullName}
              </td>

              {/* 2. E-POSTA */}
              <td className="py-3 pr-2 text-zinc-400 truncate" title={user.email}>
                {user.email}
              </td>

              {/* 3. ROLLER */}
              <td className="py-3 pr-2">
                {editingUserId === user.id && allRoles ? (
                  // DÜZENLEME MODU
                  <div className="flex flex-wrap gap-2">
                    {allRoles.map(role => (
                      <label key={role.id} className="flex items-center gap-1 cursor-pointer select-none hover:bg-zinc-800 px-1 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedRoles.includes(role.id)} // ID ile kontrol
                          onChange={() => toggleRole(role.id)}
                          className="accent-white w-3 h-3"
                        />
                        <span className="text-[10px] text-white uppercase">{role.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  // GÖSTERİM MODU
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? user.roles.map(({ role }) => (
                      <span key={role.id} className={`text-[9px] px-1.5 py-0.5 border ${role.name === 'ADMIN' ? 'border-red-900 text-red-400 bg-red-900/10' : 'border-zinc-700 text-zinc-400'}`}>
                        {role.name}
                      </span>
                    )) : <span className="text-zinc-600 italic text-[9px]">Rol Yok</span>}
                  </div>
                )}
              </td>

              {/* 4. İŞLEMLER */}
              {(canAssignRole || canDeleteUser) && (
                <td className="py-3 text-right">
                  {editingUserId === user.id ? (
                    // KAYDET / İPTAL BUTONLARI
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleSaveRoles(user.id)} className="text-green-500 hover:text-green-400 p-1 hover:bg-green-900/20 rounded transition-colors" title="Kaydet">
                        <CheckIcon className="w-4 h-4"/>
                      </button>
                      <button onClick={() => setEditingUserId(null)} className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded transition-colors" title="İptal">
                        <XMarkIcon className="w-4 h-4"/>
                      </button>
                    </div>
                  ) : (
                    // DÜZENLE / SİL BUTONLARI
                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      {canAssignRole && (
                        <button onClick={() => handleStartEdit(user)} className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-900/20 rounded transition-colors" title="Rolleri Düzenle">
                          <PencilSquareIcon className="w-4 h-4"/>
                        </button>
                      )}
                      {canDeleteUser && user.id !== currentUserId && (
                        <button onClick={() => handleDeleteUser(user)} className="text-red-500 hover:text-red-400 p-1 hover:bg-red-900/20 rounded transition-colors" title="Sil">
                          <TrashIcon className="w-4 h-4"/>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              )}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}