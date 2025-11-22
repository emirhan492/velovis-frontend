"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "src/app/lib/api";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline"; // İkonları ekledik

// Slug Helper
function slugify(text: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return text.split('').map(char => trMap[char] || char).join('').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Temel Form Verileri
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stockQuantity: "",
    shortDescription: "",
    longDescription: "",
    primaryPhotoUrl: "",
    categoryId: "",
  });

  // 👇 YENİ: Ekstra Fotoğraflar State'i
  const [otherPhotos, setOtherPhotos] = useState<string[]>([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        stockQuantity: initialData.stockQuantity,
        shortDescription: initialData.shortDescription,
        longDescription: initialData.longDescription,
        primaryPhotoUrl: initialData.primaryPhotoUrl || "",
        categoryId: initialData.categoryId || "",
      });

      // Eğer düzenleme modundaysak ve ürünün yan fotoğrafları varsa onları da yükle
      if (initialData.photos && initialData.photos.length > 0) {
        // isPrimary: false olanları filtrele ve sadece URL'lerini al
        const extras = initialData.photos
          .filter((p: any) => !p.isPrimary)
          .map((p: any) => p.url);
        setOtherPhotos(extras);
      }
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 👇 FOTOĞRAF EKLEME/ÇIKARMA FONKSİYONLARI
  const addPhotoField = () => {
    setOtherPhotos([...otherPhotos, ""]); // Boş bir input ekle
  };

  const removePhotoField = (index: number) => {
    const newPhotos = [...otherPhotos];
    newPhotos.splice(index, 1);
    setOtherPhotos(newPhotos);
  };

  const handlePhotoChange = (index: number, value: string) => {
    const newPhotos = [...otherPhotos];
    newPhotos[index] = value;
    setOtherPhotos(newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Boş fotoğraf inputlarını temizle
    const cleanedPhotos = otherPhotos.filter(url => url.trim() !== "");

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      slug: slugify(formData.name),
      otherPhotos: cleanedPhotos, // 👇 Backend'e gönderiyoruz
    };

    try {
      if (initialData) {
        await api.patch(`/products/${initialData.id}`, payload);
        alert("Ürün ve fotoğraflar güncellendi!");
      } else {
        await api.post("/products", payload);
        alert("Ürün oluşturuldu!");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message;
      alert("Bir hata oluştu: " + (Array.isArray(msg) ? msg.join(", ") : msg));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-zinc-500 focus:outline-none transition-colors";
  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ... (DİĞER ALANLAR AYNI) ... */}
        <div className="md:col-span-2">
          <label className={labelClass}>Ürün Adı</label>
          <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Örn: Vintage Deri Ceket" />
        </div>

        <div>
          <label className={labelClass}>Fiyat (TL)</label>
          <input name="price" type="number" value={formData.price} onChange={handleChange} required className={inputClass} placeholder="0.00" />
        </div>

        <div>
          <label className={labelClass}>Stok Adedi</label>
          <input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} required className={inputClass} placeholder="0" />
        </div>

        <div>
          <label className={labelClass}>Kategori</label>
          <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className={inputClass}>
            <option value="">Seçiniz...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Ana Fotoğraf */}
        <div>
          <label className={labelClass}>Ana Fotoğraf URL (Kapak)</label>
          <input name="primaryPhotoUrl" value={formData.primaryPhotoUrl} onChange={handleChange} required className={inputClass} placeholder="/pics/kapak.jpg" />
        </div>

        {/* 👇 YENİ: EKSTRA FOTOĞRAFLAR BÖLÜMÜ 👇 */}
        <div className="md:col-span-2 border-t border-zinc-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <label className={labelClass}>Diğer Fotoğraflar (Galeri)</label>
            <button 
              type="button" 
              onClick={addPhotoField}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
            >
              <PlusIcon className="w-4 h-4" /> Fotoğraf Ekle
            </button>
          </div>

          <div className="space-y-3">
            {otherPhotos.length === 0 && (
              <p className="text-xs text-zinc-600 italic">Henüz ek fotoğraf yok. "Fotoğraf Ekle" butonuna basarak ekleyebilirsiniz.</p>
            )}
            
            {otherPhotos.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handlePhotoChange(index, e.target.value)}
                  className={inputClass}
                  placeholder={`/pics/detay-${index + 1}.jpg`}
                />
                <button
                  type="button"
                  onClick={() => removePhotoField(index)}
                  className="bg-red-900/20 border border-red-900 text-red-500 px-3 hover:bg-red-900/40 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* 👆 -------------------------------- 👆 */}

        <div className="md:col-span-2">
          <label className={labelClass}>Kısa Açıklama</label>
          <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Detaylı Açıklama</label>
          <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} required rows={5} className={inputClass} />
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 text-zinc-400 hover:text-white text-xs uppercase tracking-widest font-bold">
          İptal
        </button>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest font-bold disabled:opacity-50">
          {loading ? "Kaydediliyor..." : (initialData ? "Güncelle" : "Oluştur")}
        </button>
      </div>

    </form>
  );
}