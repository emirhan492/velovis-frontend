import RoleManager from "../../../components/admin/RoleManager"; // 1. Component'i import et (göreceli yolla)
import UserManager from "../../../components/admin/UserManager";

export default function AdminDashboardPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-400">
        Admin Dashboard
      </h1>
      <p className="mt-4">
        Rolleri ve yetkileri yönetin.
      </p>
      
      {/* 2. Component'i buraya yerleştir */}
      <RoleManager />
      
      {/* TODO (Bir Sonraki Adım):
        Buraya 'UserManager' (Kullanıcıya Rol Atama) component'i de gelecek.
      */}
      <UserManager />
    </main>
  );
}