"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "src/app/lib/api";
import { useAuthStore } from "src/app/lib/store/auth.store";
import { PERMISSIONS } from "src/app/lib/constants";
import { TrashIcon, PencilSquareIcon, PlusIcon, XMarkIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// --- TİPLER ---
type Role = { id: string; name: string; permissions: { permissionKey: string }[]; };
const fetchRoles = async (): Promise<Role[]> => { const { data } = await api.get('/roles'); return data; };
const fetchAllPermissions = async (): Promise<string[]> => { const { data } = await api.get('/roles/permissions'); return data; };

export default function RoleManager() {
  const queryClient = useQueryClient();
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Hangi rollerin detayları açık? (ID listesi tutuyoruz)
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);

  const userPermissions = useAuthStore((state) => state.user?.permissions);
  const canCreateRole = userPermissions?.includes(PERMISSIONS.ROLES.CREATE);
  const canUpdateRole = userPermissions?.includes(PERMISSIONS.ROLES.UPDATE);
  const canDeleteRole = userPermissions?.includes(PERMISSIONS.ROLES.DELETE);

  // --- SORGULAR ---
  const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: !!userPermissions && userPermissions.includes(PERMISSIONS.ROLES.READ),
  });

  const { data: allPermissions, isLoading: isLoadingPermissions } = useQuery<string[]>({
    queryKey: ['allPermissions'],
    queryFn: fetchAllPermissions,
    enabled: !!userPermissions && (userPermissions.includes(PERMISSIONS.ROLES.READ) || userPermissions.includes(PERMISSIONS.ROLES.UPDATE)),
  });

  // --- MUTATIONS ---
  const createRoleMutation = useMutation({ mutationFn: (roleName: string) => api.post('/roles', { name: roleName }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); setNewRoleName(""); } });
  const deleteRoleMutation = useMutation({ mutationFn: (roleId: string) => api.delete(`/roles/${roleId}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); } });
  
  const handleCreateRole = (e: React.FormEvent) => { e.preventDefault(); if (!newRoleName.trim()) return; createRoleMutation.mutate(newRoleName); };
  const handleDeleteRole = (role: Role) => { if (window.confirm(`'${role.name}' rolünü silmek istediğinize emin misiniz?`)) { deleteRoleMutation.mutate(role.id); } };

  //Aç/Kapa Fonksiyonu
  const toggleExpand = (roleId: string) => {
    if (expandedRoles.includes(roleId)) {
      setExpandedRoles(expandedRoles.filter(id => id !== roleId));
    } else {
      setExpandedRoles([...expandedRoles, roleId]);
    }
  };

  // --- RENDER ---
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* YENİ ROL OLUŞTUR */}
        {canCreateRole && (
          <div className="md:col-span-1">
            <div className="border border-zinc-800 bg-zinc-900/20 p-6 h-full">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> Yeni Rol
              </h2>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div>
                  <label htmlFor="roleName" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Rol Adı
                  </label>
                  <input 
                    id="roleName" 
                    type="text" 
                    value={newRoleName} 
                    onChange={(e) => setNewRoleName(e.target.value)} 
                    placeholder="Örn: EDITOR"
                    className="block w-full bg-zinc-950 border border-zinc-800 p-3 text-white text-xs placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors uppercase font-mono" 
                  />
                </div>
                
                {createRoleMutation.isError && <p className="text-xs text-red-500">Hata: {(createRoleMutation.error as any).response?.data?.message || createRoleMutation.error.message}</p>}
                
                <button 
                  type="submit" 
                  disabled={createRoleMutation.isPending} 
                  className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {createRoleMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MEVCUT ROLLER */}
        <div className="md:col-span-2">
          {isLoadingRoles && <p className="text-xs text-zinc-500 animate-pulse">Roller yükleniyor...</p>}
          {rolesError && <p className="text-xs text-red-500">Yetki yok veya hata oluştu.</p>}
          
          {roles && (
            <div className="space-y-4">
              {roles.map(role => {
                // Bu rol açık mı?
                const isExpanded = expandedRoles.includes(role.id);
                // Gösterilecek yetkiler (Açıksa hepsi, kapalıysa ilk 8)
                const visiblePermissions = isExpanded ? role.permissions : role.permissions.slice(0, 8);
                // Gizli kalan sayısı
                const hiddenCount = role.permissions.length - 8;

                return (
                  <div key={role.id} className="border border-zinc-800 bg-zinc-950 p-4 group hover:border-zinc-600 transition-colors">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-light text-white uppercase tracking-wide">{role.name}</h3>
                        <span className="text-[10px] text-zinc-600 font-mono">{role.permissions.length} Yetki Tanımlı</span>
                      </div>
                      
                      <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {canUpdateRole && (
                          <button onClick={() => setEditingRole(role)} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors" title="Düzenle">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteRole && role.name !== 'ADMIN' && role.name !== 'USER' && (
                          <button onClick={() => handleDeleteRole(role)} disabled={deleteRoleMutation.isPending && deleteRoleMutation.variables === role.id} className="p-2 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Sil">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Yetki Listesi */}
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.length > 0 ? (
                        visiblePermissions.map(perm => (
                          <span key={perm.permissionKey} className="text-[9px] border border-zinc-800 text-zinc-500 px-1.5 py-0.5 bg-zinc-900/50">
                            {perm.permissionKey}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-700 italic">Yetki yok</span>
                      )}

                      {/* AÇMA / KAPAMA BUTONLARI */}
                      {!isExpanded && hiddenCount > 0 && (
                        <button 
                          onClick={() => toggleExpand(role.id)}
                          className="text-[9px] text-zinc-400 hover:text-white px-1.5 py-0.5 border border-dashed border-zinc-700 hover:border-zinc-500 transition-all flex items-center gap-1"
                        >
                          +{hiddenCount} diğer
                        </button>
                      )}

                      {isExpanded && role.permissions.length > 8 && (
                        <button 
                          onClick={() => toggleExpand(role.id)}
                          className="text-[9px] text-zinc-500 hover:text-white px-1.5 py-0.5 transition-all flex items-center gap-1 ml-2"
                        >
                          <ChevronUpIcon className="w-3 h-3" /> Kapat
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
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

// =================================================================
// MODAL COMPONENT
// =================================================================
function EditRoleModal({ role, allPermissions, isLoading, onClose }: { role: Role; allPermissions: string[]; isLoading: boolean; onClose: () => void; }) {
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions.map(p => p.permissionKey));

  const updateRoleMutation = useMutation({
    mutationFn: (permissionKeys: string[]) => api.patch(`/roles/${role.id}/permissions`, { permissions: permissionKeys }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); onClose(); }
  });

  const handleTogglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSave = () => { updateRoleMutation.mutate(selectedPermissions); };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const group = perm.split(':')[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/30">
          <div>
            <h3 className="text-lg font-light text-white uppercase tracking-widest">Yetkileri Düzenle</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">ROL: {role.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <p className="text-zinc-500 text-xs animate-pulse">Yetkiler yükleniyor...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group} className="border border-zinc-900 p-4 bg-zinc-900/10">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-900 pb-2">{group.toUpperCase()}</h4>
                  <div className="space-y-2">
                    {perms.map(perm => (
                      <label key={perm} className="flex items-start gap-2 cursor-pointer group/item">
                        <div className={`w-4 h-4 mt-0.5 border flex items-center justify-center transition-colors ${selectedPermissions.includes(perm) ? 'bg-white border-white' : 'border-zinc-700 bg-transparent group-hover/item:border-zinc-500'}`}>
                           {selectedPermissions.includes(perm) && <CheckIcon className="w-3 h-3 text-black" />}
                        </div>
                        <input type="checkbox" checked={selectedPermissions.includes(perm)} onChange={() => handleTogglePermission(perm)} className="hidden" />
                        <span className={`text-xs font-mono transition-colors ${selectedPermissions.includes(perm) ? 'text-white' : 'text-zinc-600 group-hover/item:text-zinc-400'}`}>{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors">İptal</button>
          <button onClick={handleSave} disabled={updateRoleMutation.isPending} className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50">{updateRoleMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </div>
      </div>
    </div>
  );
}