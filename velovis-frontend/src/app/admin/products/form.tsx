"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "src/app/lib/api";
import { TrashIcon, PlusIcon, CubeIcon } from "@heroicons/react/24/outline";

// Slug Helper
function slugify(text: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return text.split('').map(char => trMap[char] || char).join('').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

// Beden Tipi
type SizeItem = {
  size: string;
  stock: number;
};

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Temel Form Verileri (stockQuantity ARTIK YOK)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    shortDescription: "",
    longDescription: "",
    primaryPhotoUrl: "",
    categoryId: "",
  });

  // Ekstra Fotoğraflar State'i
  const [otherPhotos, setOtherPhotos] = useState<string[]>([]);

  // YENİ: Beden ve Stok Listesi State'i
  const [sizes, setSizes] = useState<SizeItem[]>([{ size: "", stock: 0 }]);

  useEffect(() => {
    // Kategorileri Çek
    api.get("/categories").then((res) => setCategories(res.data));
    
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        shortDescription: initialData.shortDescription,
        longDescription: initialData.longDescription,
        primaryPhotoUrl: initialData.primaryPhotoUrl || "",
        categoryId: initialData.categoryId || "",
      });

      // Fotoğrafları Yükle
      if (initialData.photos && initialData.photos.length > 0) {
        const extras = initialData.photos
          .filter((p: any) => !p.isPrimary)
          .map((p: any) => p.url);
        setOtherPhotos(extras);
      }

      // YENİ: Bedenleri Yükle (Eğer varsa)
      if (initialData.sizes && initialData.sizes.length > 0) {
        setSizes(initialData.sizes.map((s: any) => ({ size: s.size, stock: s.stock })));
      } else {
        // Eski veri yapısından geliyorsa veya hiç yoksa boş başlat
        setSizes([{ size: "", stock: 0 }]);
      }
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- FOTOĞRAF İŞLEMLERİ ---
  const addPhotoField = () => {
    setOtherPhotos([...otherPhotos, ""]); 
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

  // --- YENİ: BEDEN & STOK İŞLEMLERİ ---
  const addSizeField = () => {
    setSizes([...sizes, { size: "", stock: 0 }]);
  };

  const removeSizeField = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  const handleSizeChange = (index: number, field: "size" | "stock", value: string | number) => {
    const newSizes = [...sizes];
    if (field === "stock") {
      newSizes[index].stock = Number(value);
    } else {
      newSizes[index].size = String(value).toUpperCase(); // Bedenler genelde büyük harf olur
    }
    setSizes(newSizes);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Boş verileri temizle
    const cleanedPhotos = otherPhotos.filter(url => url.trim() !== "");
    const cleanedSizes = sizes.filter(s => s.size.trim() !== ""); // Boş beden ismi girilenleri at

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      slug: slugify(formData.name),
      otherPhotos: cleanedPhotos,
      sizes: cleanedSizes, // Backend'e beden listesini gönderiyoruz
    };

    try {
      if (initialData) {
        await api.patch(`/products/${initialData.id}`, payload);
        alert("Ürün başarıyla güncellendi!");
      } else {
        await api.post("/products", payload);
        alert("Ürün başarıyla oluşturuldu!");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message;
      alert("Hata: " + (Array.isArray(msg) ? msg.join(", ") : msg));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-zinc-500 focus:outline-none transition-colors";
  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SOL KOLON: Temel Bilgiler */}
        <div className="md:col-span-2 space-y-8">
            <div>
              <label className={labelClass}>Ürün Adı</label>
              <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Ceket" />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Fiyat (TL)</label>
                  <input name="price" type="number" value={formData.price} onChange={handleChange} required className={inputClass} placeholder="0.00" />
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
            </div>
        </div>

        {/* --- YENİ: BEDEN VE STOK YÖNETİMİ --- */}
        <div className="md:col-span-2 border border-zinc-800 bg-zinc-900/30 p-6 rounded-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <CubeIcon className="w-5 h-5 text-zinc-400" />
                    <label className="text-xs font-bold text-white uppercase tracking-widest">Beden & Stok Yönetimi</label>
                </div>
                <button 
                  type="button" 
                  onClick={addSizeField}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-500 hover:text-green-400 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" /> Beden Ekle
                </button>
            </div>

            <div className="space-y-3">
                {sizes.length === 0 && (
                    <div className="text-center p-4 border border-zinc-800 border-dashed text-zinc-500 text-xs italic">
                        Hiç beden eklenmemiş. Lütfen beden ekleyiniz.
                    </div>
                )}

                {sizes.map((item, index) => (
                    <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="w-1/3">
                            <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Beden (S, M, 42..)</label>
                            <input
                                type="text"
                                value={item.size}
                                onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                                className={inputClass}
                                placeholder="BEDEN"
                                required
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Stok Adedi</label>
                            <input
                                type="number"
                                value={item.stock}
                                onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
                                className={inputClass}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeSizeField(index)}
                            className="mb-1 p-3 bg-red-900/20 border border-red-900 text-red-500 hover:bg-red-900/40 transition-colors h-[46px]"
                            title="Bu bedeni sil"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-zinc-500 mt-4">* Aynı bedenden birden fazla satır eklememeye dikkat ediniz.</p>
        </div>

        {/* Ana Fotoğraf */}
        <div className="md:col-span-2">
          <label className={labelClass}>Ana Fotoğraf URL (Kapak)</label>
          <input name="primaryPhotoUrl" value={formData.primaryPhotoUrl} onChange={handleChange} required className={inputClass} placeholder="Ana Görsel URL" />
        </div>

        {/* EKSTRA FOTOĞRAFLAR BÖLÜMÜ */}
        <div className="md:col-span-2 border-t border-zinc-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <label className={labelClass}>Galeri Fotoğrafları</label>
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
              <p className="text-xs text-zinc-600 italic">Henüz ek fotoğraf yok.</p>
            )}
            
            {otherPhotos.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handlePhotoChange(index, e.target.value)}
                  className={inputClass}
                  placeholder={`Galeri Görsel URL #${index + 1}`}
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

        <div className="md:col-span-2">
          <label className={labelClass}>Kısa Açıklama</label>
          <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Detaylı Açıklama</label>
          <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} required rows={5} className={inputClass} />
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4 sticky bottom-0 bg-black/90 backdrop-blur-sm p-4 border-b border-zinc-800 md:border-b-0">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 text-zinc-400 hover:text-white text-xs uppercase tracking-widest font-bold">
          İptal
        </button>
        <button type="submit" disabled={loading} className="px-8 py-3 bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest font-bold disabled:opacity-50">
          {loading ? "Kaydediliyor..." : (initialData ? "Değişiklikleri Kaydet" : "Ürünü Oluştur")}
        </button>
      </div>

    </form>
  );
}