"use client"; 

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "src/app/lib/api";
import { useAuthStore } from "src/app/lib/store/auth.store"; 
import { PERMISSIONS } from "src/app/lib/constants"; 

type Role = { id: string; name: string; permissions: { permissionKey: string }[]; };
const fetchRoles = async (): Promise<Role[]> => { const { data } = await api.get('/roles'); return data; };
const fetchAllPermissions = async (): Promise<string[]> => { const { data } = await api.get('/roles/permissions'); return data; };

export default function RoleManager() {
  const queryClient = useQueryClient();
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const userPermissions = useAuthStore((state) => state.user?.permissions);
  const canCreateRole = userPermissions?.includes(PERMISSIONS.ROLES.CREATE);
  const canUpdateRole = userPermissions?.includes(PERMISSIONS.ROLES.UPDATE);
  const canDeleteRole = userPermissions?.includes(PERMISSIONS.ROLES.DELETE);
  
  // =================================================================
  // --- ÇÖZÜM BURADA (SORGULARI BEKLET) ---
  // =================================================================

  // 1. MEVCUT ROLLERİ ÇEK
  const { 
    data: roles, 
    isLoading: isLoadingRoles,
    error: rolesError 
  } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    // Bu sorguyu SADECE 'userPermissions' yüklendiyse
    // VE kullanıcının 'roles:read' yetkisi varsa çalıştır.
    enabled: !!userPermissions && userPermissions.includes(PERMISSIONS.ROLES.READ),
  });

  // 2. SİSTEMDEKİ TÜM YETKİLERİ ÇEK
  const { 
    data: allPermissions, 
    isLoading: isLoadingPermissions 
  } = useQuery<string[]>({
    queryKey: ['allPermissions'],
    queryFn: fetchAllPermissions,
    // Bu sorguyu SADECE 'userPermissions' yüklendiyse
    // VE kullanıcının 'roles:read' VEYA 'roles:update' yetkisi varsa çalıştır.
    enabled: !!userPermissions && (
      userPermissions.includes(PERMISSIONS.ROLES.READ) || 
      userPermissions.includes(PERMISSIONS.ROLES.UPDATE)
    ),
  });
  
  // =================================================================
  // --- ÇÖZÜM BİTTİ ---
  // =================================================================


  const createRoleMutation = useMutation({ mutationFn: (roleName: string) => api.post('/roles', { name: roleName }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); setNewRoleName(""); } });
  const deleteRoleMutation = useMutation({ mutationFn: (roleId: string) => api.delete(`/roles/${roleId}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); } });
  const handleCreateRole = (e: React.FormEvent) => { e.preventDefault(); if (!newRoleName.trim()) return; createRoleMutation.mutate(newRoleName); };
  const handleDeleteRole = (role: Role) => { if (window.confirm(`'${role.name}' rolünü silmek istediğinize emin misiniz?`)) { deleteRoleMutation.mutate(role.id); } };

  return (
    <>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Yeni Rol Oluştur */}
        {canCreateRole && (
          <div>
            <h2 className="text-2xl font-semibold text-blue-300">Yeni Rol Oluştur</h2>
            <form onSubmit={handleCreateRole} className="mt-4 rounded-lg bg-gray-800 p-4">
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-300">Rol Adı</label>
              <input id="roleName" type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 p-2 text-white" />
              {createRoleMutation.isError && <p className="mt-2 text-sm text-red-500">Hata: {(createRoleMutation.error as any).response?.data?.message || createRoleMutation.error.message}</p>}
              <button type="submit" disabled={createRoleMutation.isPending} className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                {createRoleMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </form>
          </div>
        )}

        {/* Mevcut Roller */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-300">Mevcut Roller</h2>
          {isLoadingRoles && <p className="text-yellow-400">Roller yükleniyor...</p>}
          {rolesError && <p className="text-red-500">Rolleri listeleme yetkiniz yok veya bir hata oluştu.</p>}
          {roles && (
            <div className="mt-4 space-y-4">
              {roles.map(role => (
                <div key={role.id} className="rounded-lg bg-gray-800 p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-green-400">{role.name}</h3>
                    <div className="flex space-x-2">
                      {canUpdateRole && (
                        <button onClick={() => setEditingRole(role)} className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700">
                          Yetkileri Düzenle
                        </button>
                      )}
                      {canDeleteRole && role.name !== 'ADMIN' && role.name !== 'USER' && (
                        <button onClick={() => handleDeleteRole(role)} disabled={deleteRoleMutation.isPending && deleteRoleMutation.variables === role.id} className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                  {deleteRoleMutation.isError && deleteRoleMutation.variables === role.id && <p className="mt-2 text-sm text-red-500">Hata: {(deleteRoleMutation.error as any).response?.data?.message || deleteRoleMutation.error.message}</p>}
                  <p className="mt-2 text-sm text-gray-400">Yetkiler ({role.permissions.length}):</p>
                  <ul className="list-inside list-disc pl-2 max-h-32 overflow-y-auto">
                    {role.permissions.length > 0 ? (
                      role.permissions.map(perm => <li key={perm.permissionKey} className="text-sm text-gray-300">{perm.permissionKey}</li>)
                    ) : (
                      <li className="text-sm text-gray-500">Bu role atanmış yetki yok.</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingRole && (
        <EditRoleModal
          role={editingRole}
          allPermissions={allPermissions || []}
          isLoading={isLoadingPermissions}
          onClose={() => setEditingRole(null)}
        />
      )}
    </>
  );
}

// ... (EditRoleModal component'i aynı) ...
function EditRoleModal({ role, allPermissions, isLoading, onClose }: { role: Role; allPermissions: string[]; isLoading: boolean; onClose: () => void; }) { /* ... (içerik aynı) ... */ }